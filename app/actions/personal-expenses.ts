"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";

export async function createPersonalExpense(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('No session or User ID found', { session });
    throw new Error("You must be logged in to add a personal expense");
  }

  // Verify user exists in database before proceeding
  const existingUser = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!existingUser) {
    console.error('User not found in database', { userId: session.user.id });
    throw new Error("User account not found. Please log out and log back in.");
  }

  console.log('Creating expense for user:', session.user.id);

  const amount = parseFloat(formData.get("amount") as string);
  const note = (formData.get("note") as string)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string)?.trim() || null;
  const date = formData.get("date") as string;

  if (!amount || amount <= 0) throw new Error("Amount must be greater than 0");

  const expenseDate = date ? new Date(date) : new Date();

  try {
    const expense = await db.PersonalExpense.create({
      data: {
        amount,
        note,
        date: expenseDate,
        categoryId: categoryId || undefined,
        userId: session.user.id,
      },
    });

    // Create activity
    await createActivity(
      "PERSONAL_EXPENSE_ADDED",
      session.user.id,
      {
        amount,
        note,
        expenseId: expense.id,
      }
    );

    revalidatePath("/dashboard/personal-expenses");
    revalidatePath("/dashboard");

    return { success: true, expense };
  } catch (error) {
    console.error('Error creating personal expense:', error);
    throw error;
  }
}

export async function getPersonalExpenses() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const expenses = await db.PersonalExpense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    include: { category: true },
  });

  return expenses;
}

export async function updatePersonalExpense(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("You must be logged in to update a personal expense");

  const expenseId = formData.get("expenseId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const note = (formData.get("note") as string)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string)?.trim() || null;

  if (!amount || amount <= 0) throw new Error("Amount must be greater than 0");

  const expense = await db.PersonalExpense.update({
    where: { id: expenseId, userId: session.user.id },
    data: {
      amount,
      note,
      categoryId: categoryId || undefined,
    },
  });

  // Create activity
  await createActivity({
    userId: session.user.id,
    type: "PERSONAL_EXPENSE_UPDATED",
    metadata: {
      amount,
      note,
      expenseId: expense.id,
    },
  });

  revalidatePath("/dashboard/personal-expenses");
  revalidatePath("/dashboard");

  return { success: true, expense };
}

export async function deletePersonalExpense(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("You must be logged in to delete a personal expense");

  const expenseId = formData.get("expenseId") as string;

  const expense = await db.PersonalExpense.delete({
    where: { id: expenseId, userId: session.user.id },
  });

  // Create activity
  await createActivity({
    userId: session.user.id,
    type: "PERSONAL_EXPENSE_DELETED",
    metadata: {
      expenseId: expense.id,
    },
  });

  revalidatePath("/dashboard/personal-expenses");
  revalidatePath("/dashboard");

  return { success: true, expense };
}
