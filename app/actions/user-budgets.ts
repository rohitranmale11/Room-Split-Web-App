"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";

export async function createOrUpdateUserBudget(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('No session or User ID found', { session });
    throw new Error("You must be logged in to set a budget");
  }

  // Verify user exists in database before proceeding
  const existingUser = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!existingUser) {
    console.error('User not found in database', { userId: session.user.id });
    throw new Error("User account not found. Please log out and log back in.");
  }

  console.log('Creating budget for user:', session.user.id);

  const amount = parseFloat(formData.get("amount") as string);
  const month = parseInt(formData.get("month") as string);
  const year = parseInt(formData.get("year") as string);

  if (!amount || amount <= 0) throw new Error("Budget amount must be greater than 0");
  if (!month || month < 1 || month > 12) throw new Error("Invalid month");
  if (!year || year < 2020 || year > 2030) throw new Error("Invalid year");

  const existingBudget = await db.UserBudget.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month,
        year,
      },
    },
  });

  let budget;
  if (existingBudget) {
    budget = await db.UserBudget.update({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month,
          year,
        },
      },
      data: { amount },
    });

    // Create activity
    await createActivity({
      userId: session.user.id,
      type: "BUDGET_UPDATED",
      metadata: {
        amount,
        month,
        year,
        budgetId: budget.id,
      },
    });
  } else {
    budget = await db.UserBudget.create({
      data: {
        amount,
        month,
        year,
        userId: session.user.id,
      },
    });

    // Create activity
    await createActivity({
      userId: session.user.id,
      type: "BUDGET_CREATED",
      metadata: {
        amount,
        month,
        year,
        budgetId: budget.id,
      },
    });
  }

  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");

  return { success: true, budget };
}

export async function getBudgetStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JS months are 0-11, we want 1-12
  const currentYear = now.getFullYear();

  const budget = await db.UserBudget.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  if (!budget) return null;

  // Calculate total spent for current month
  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  const personalExpenses = await db.PersonalExpense.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { amount: true },
  });

  const totalSpent = personalExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
  const remaining = budget.amount - totalSpent;
  const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

  return {
    budget,
    totalSpent,
    remaining,
    percentageUsed,
    isOverBudget: remaining < 0,
    isNearLimit: percentageUsed >= 80,
  };
}

export async function getBudgetHistory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const budgets = await db.UserBudget.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });

  return budgets;
}
