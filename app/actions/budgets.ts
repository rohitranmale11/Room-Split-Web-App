"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBudget(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const categoryId = formData.get("categoryId") as string;
  const amountRaw = formData.get("amount") as string;
  const period = (formData.get("period") as string) || "MONTHLY";
  const roomId = (formData.get("roomId") as string) || null;

  if (!categoryId || !amountRaw) throw new Error("Category and amount are required");

  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Please enter a valid amount");

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category || category.type !== "expense") throw new Error("Invalid category");

  const existing = await db.budget.findFirst({
    where: {
      userId: session.user.id,
      categoryId,
      roomId: roomId || null,
    },
  });

  if (existing) {
    await db.budget.update({
      where: { id: existing.id },
      data: { amount, period },
    });
  } else {
    await db.budget.create({
      data: {
        userId: session.user.id,
        categoryId,
        amount,
        period,
        roomId: roomId || undefined,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}

export async function deleteBudget(budgetId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const budget = await db.budget.findUnique({ where: { id: budgetId } });
  if (!budget || budget.userId !== session.user.id) throw new Error("Budget not found");

  await db.budget.delete({ where: { id: budgetId } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}
