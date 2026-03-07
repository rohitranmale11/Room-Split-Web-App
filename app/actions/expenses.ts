"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const roomId = formData.get("roomId") as string;
  const title = (formData.get("title") as string)?.trim();
  const amountRaw = formData.get("amount") as string;

  if (!roomId || !title || !amountRaw) {
    throw new Error("All fields are required");
  }

  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Please enter a valid amount");
  }

  const membership = await db.roomMember.findFirst({
    where: {
      roomId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    throw new Error("You are not a member of this room");
  }

  const members = await db.roomMember.findMany({
    where: { roomId },
    include: { user: true },
  });

  if (members.length === 0) {
    throw new Error("This room has no members yet");
  }

  const splitAmount = amount / members.length;

  const expense = await db.expense.create({
    data: {
      roomId,
      title,
      amount,
      paidById: session.user.id,
      participants: {
        create: members.map((m) => ({
          userId: m.userId,
          amountOwed: splitAmount,
        })),
      },
    },
  });

  revalidatePath(`/dashboard/rooms/${roomId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/balances");

  return { success: true, expense };
}

