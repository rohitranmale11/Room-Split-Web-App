"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createIncome(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = (formData.get("title") as string)?.trim();
  const amountRaw = formData.get("amount") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const dateStr = formData.get("date") as string;

  if (!title || !amountRaw) throw new Error("Title and amount are required");

  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Please enter a valid amount");

  await db.income.create({
    data: {
      userId: session.user.id,
      title,
      amount,
      categoryId: categoryId || undefined,
      notes: notes || undefined,
      date: dateStr ? new Date(dateStr) : undefined,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}

export async function updateIncome(incomeId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const income = await db.income.findUnique({ where: { id: incomeId } });
  if (!income || income.userId !== session.user.id) throw new Error("Income not found");

  const title = (formData.get("title") as string)?.trim();
  const amountRaw = formData.get("amount") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title || !amountRaw) throw new Error("Title and amount are required");
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

  await db.income.update({
    where: { id: incomeId },
    data: {
      title,
      amount,
      categoryId: categoryId || undefined,
      notes: notes || undefined,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}

export async function deleteIncome(incomeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const income = await db.income.findUnique({ where: { id: incomeId } });
  if (!income || income.userId !== session.user.id) throw new Error("Income not found");

  await db.income.delete({ where: { id: incomeId } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}
