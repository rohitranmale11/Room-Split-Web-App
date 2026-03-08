"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getMonthlyReport(year?: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { expenses: [], income: [] };

  const y = year ?? new Date().getFullYear();
  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31);

  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: {
      room: {
        include: {
          expenses: {
            where: { date: { gte: start, lte: end } },
            include: { category: true },
          },
        },
      },
    },
  });

  const incomes = await db.income.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
    include: { category: true },
  });

  const monthlyExpense: Record<string, number> = {};
  const monthlyIncome: Record<string, number> = {};
  for (let m = 1; m <= 12; m++) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    monthlyExpense[key] = 0;
    monthlyIncome[key] = 0;
  }

  for (const mb of memberships) {
    for (const e of mb.room.expenses) {
      const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
      monthlyExpense[key] = (monthlyExpense[key] ?? 0) + e.amount;
    }
  }
  for (const i of incomes) {
    const key = `${i.date.getFullYear()}-${String(i.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyIncome[key] = (monthlyIncome[key] ?? 0) + i.amount;
  }

  const expenses = Object.entries(monthlyExpense)
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const income = Object.entries(monthlyIncome)
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { expenses, income };
}

export async function getCategoryReport() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: {
      room: {
        include: {
          expenses: { include: { category: true } },
        },
      },
    },
  });

  const byCategory = new Map<string, number>();
  for (const mb of memberships) {
    for (const e of mb.room.expenses) {
      const name = e.category?.name ?? "Other";
      byCategory.set(name, (byCategory.get(name) ?? 0) + e.amount);
    }
  }

  return Array.from(byCategory.entries())
    .map(([name, amount]) => ({ category: name, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getRoomReport() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: {
      room: {
        include: {
          expenses: true,
        },
      },
    },
  });

  return memberships
    .map((m) => ({
      roomId: m.room.id,
      roomName: m.room.roomName,
      currency: m.room.currency || "USD",
      totalExpense: m.room.expenses.reduce((s, e) => s + e.amount, 0),
    }))
    .sort((a, b) => b.totalExpense - a.totalExpense);
}
