"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";

type ParticipantInput = {
  userId?: string;
  contactId?: string;
  amountOwed?: number;
  percentage?: number;
  name?: string; // For contacts
};

function parseParticipants(
  members: { userId: string }[],
  totalAmount: number,
  splitType: string,
  participantsJson: string | null
): { userId: string; amountOwed: number; percentage: number | null }[] {
  if (splitType === "EQUAL") {
    const share = totalAmount / members.length;
    return members.map((m) => ({
      userId: m.userId,
      amountOwed: Math.round(share * 100) / 100,
      percentage: null,
    }));
  }

  if (!participantsJson) {
    const share = totalAmount / members.length;
    return members.map((m) => ({
      userId: m.userId,
      amountOwed: Math.round(share * 100) / 100,
      percentage: null,
    }));
  }

  let parsed: ParticipantInput[];
  try {
    parsed = JSON.parse(participantsJson) as ParticipantInput[];
  } catch {
    const share = totalAmount / members.length;
    return members.map((m) => ({
      userId: m.userId,
      amountOwed: Math.round(share * 100) / 100,
      percentage: null,
    }));
  }

  const memberIds = new Set(members.map((m) => m.userId));
  const result: { userId: string; amountOwed: number; percentage: number | null }[] = [];

  if (splitType === "PERCENTAGE") {
    for (const p of parsed) {
      if (!memberIds.has(p.userId)) continue;
      const pct = Math.min(100, Math.max(0, p.percentage ?? 0));
      const amountOwed = Math.round((totalAmount * pct) / 100 * 100) / 100;
      result.push({ userId: p.userId, amountOwed, percentage: pct });
    }
    const covered = new Set(result.map((r) => r.userId));
    const remaining = members.filter((m) => !covered.has(m.userId));
    if (remaining.length && result.length) {
      const allocated = result.reduce((s, r) => s + r.amountOwed, 0);
      const leftover = Math.round((totalAmount - allocated) * 100) / 100;
      const perLeft = Math.round((leftover / remaining.length) * 100) / 100;
      remaining.forEach((m) => result.push({ userId: m.userId, amountOwed: perLeft, percentage: null }));
    } else if (remaining.length) {
      const share = totalAmount / members.length;
      members.forEach((m) =>
        result.push({ userId: m.userId, amountOwed: Math.round(share * 100) / 100, percentage: null })
      );
    }
  } else {
    for (const p of parsed) {
      if (!memberIds.has(p.userId)) continue;
      const amt = Math.max(0, p.amountOwed ?? 0);
      result.push({ userId: p.userId, amountOwed: Math.round(amt * 100) / 100, percentage: null });
    }
    const covered = new Set(result.map((r) => r.userId));
    const remaining = members.filter((m) => !covered.has(m.userId));
    if (remaining.length) {
      const allocated = result.reduce((s, r) => s + r.amountOwed, 0);
      const leftover = Math.round((totalAmount - allocated) * 100) / 100;
      const perLeft = Math.round((leftover / remaining.length) * 100) / 100;
      remaining.forEach((m) => result.push({ userId: m.userId, amountOwed: perLeft, percentage: null }));
    }
  }

  return result;
}

export async function createExpense(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const roomId = formData.get("roomId") as string;
  const title = (formData.get("title") as string)?.trim();
  const amountRaw = formData.get("amount") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const splitType = ((formData.get("splitType") as string) || "EQUAL") as "EQUAL" | "EXACT" | "PERCENTAGE";
  const participantsJson = (formData.get("participantsJson") as string) || null;
  const dateStr = formData.get("date") as string;

  if (!roomId || !title || !amountRaw) throw new Error("Title and amount are required");

  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Please enter a valid amount");

  const membership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership) throw new Error("You are not a member of this room");

  const members = await db.roomMember.findMany({
    where: { roomId },
    select: { userId: true },
  });
  if (members.length === 0) throw new Error("This room has no members yet");

  const participants = parseParticipants(members, amount, splitType, participantsJson);

  const expense = await db.expense.create({
    data: {
      roomId,
      title,
      amount,
      notes: notes || undefined,
      splitType,
      paidById: session.user.id,
      categoryId: categoryId || undefined,
      date: dateStr ? new Date(dateStr) : undefined,
      participants: {
        create: participants.map((p) => ({
          userId: p.userId,
          amountOwed: p.amountOwed,
          percentage: p.percentage ?? undefined,
        })),
      },
    },
    include: { room: true },
  });

  await createActivity(
    "EXPENSE_ADDED",
    session.user.id,
    { expenseTitle: title, amount, roomName: expense.room.roomName },
    roomId
  );

  revalidatePath(`/dashboard/rooms/${roomId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/balances");
  return { success: true, expense };
}

export async function updateExpense(expenseId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const expense = await db.expense.findUnique({ where: { id: expenseId }, include: { room: true } });
  if (!expense) throw new Error("Expense not found");

  const membership = await db.roomMember.findFirst({
    where: { roomId: expense.roomId, userId: session.user.id },
  });
  if (!membership) throw new Error("You are not a member of this room");

  const title = (formData.get("title") as string)?.trim();
  const amountRaw = formData.get("amount") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title || !amountRaw) throw new Error("Title and amount are required");
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

  const members = await db.roomMember.findMany({ where: { roomId: expense.roomId }, select: { userId: true } });
  const splitType = (expense.splitType || "EQUAL") as "EQUAL" | "EXACT" | "PERCENTAGE";
  const participantsJson = formData.get("participantsJson") as string | null;
  const participants = parseParticipants(members, amount, splitType, participantsJson);

  await db.$transaction([
    db.expenseParticipant.deleteMany({ where: { expenseId } }),
    db.expense.update({
      where: { id: expenseId },
      data: {
        title,
        amount,
        notes: notes || undefined,
        categoryId: categoryId || undefined,
        participants: {
          create: participants.map((p) => ({
            userId: p.userId,
            amountOwed: p.amountOwed,
            percentage: p.percentage ?? undefined,
          })),
        },
      },
    }),
  ]);

  revalidatePath(`/dashboard/rooms/${expense.roomId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/balances");
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const expense = await db.expense.findUnique({ where: { id: expenseId } });
  if (!expense) throw new Error("Expense not found");

  const membership = await db.roomMember.findFirst({
    where: { roomId: expense.roomId, userId: session.user.id },
  });
  if (!membership) throw new Error("You are not a member of this room");

  const roomId = expense.roomId;
  const room = await db.room.findUnique({ where: { id: roomId } });
  await db.expense.delete({ where: { id: expenseId } });

  await createActivity(
    "EXPENSE_DELETED",
    session.user.id,
    { expenseTitle: expense.title, amount: expense.amount, roomName: room?.roomName },
    roomId
  );

  revalidatePath(`/dashboard/rooms/${roomId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/balances");
  return { success: true };
}
