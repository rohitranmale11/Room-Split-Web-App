"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type MonthlyData = { month: string; expense: number; income: number };
export type CategoryBreakdown = { name: string; value: number; fill?: string };

const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 76%, 36%)",
  "hsl(47, 96%, 53%)",
  "hsl(280, 87%, 65%)",
  "hsl(340, 82%, 52%)",
];

export async function getAnalyticsData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      monthlyData: [] as MonthlyData[],
      expenseByCategory: [] as CategoryBreakdown[],
      incomeByCategory: [] as CategoryBreakdown[],
    };
  }

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [memberships, incomes] = await Promise.all([
    db.roomMember.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          include: {
            expenses: {
              where: { date: { gte: startOfYear } },
              include: { category: true },
            },
          },
        },
      },
    }),
    db.income.findMany({
      where: { userId: session.user.id, date: { gte: startOfYear } },
      include: { category: true },
    }),
  ]);

  const totalExpense = memberships.reduce(
    (sum, m) => sum + m.room.expenses.reduce((s, e) => s + e.amount, 0),
    0
  );
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const monthlyMap = new Map<string, { expense: number; income: number }>();
  for (let m = 0; m < 12; m++) {
    const key = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
    monthlyMap.set(key, { expense: 0, income: 0 });
  }

  for (const m of memberships) {
    for (const e of m.room.expenses) {
      const key = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`;
      const cur = monthlyMap.get(key) ?? { expense: 0, income: 0 };
      cur.expense += e.amount;
      monthlyMap.set(key, cur);
    }
  }
  for (const i of incomes) {
    const key = `${i.date.getFullYear()}-${String(i.date.getMonth() + 1).padStart(2, "0")}`;
    const cur = monthlyMap.get(key) ?? { expense: 0, income: 0 };
    cur.income += i.amount;
    monthlyMap.set(key, cur);
  }

  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month: new Date(month + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
      expense: Math.round(d.expense * 100) / 100,
      income: Math.round(d.income * 100) / 100,
    }));

  const expenseCatMap = new Map<string, number>();
  for (const m of memberships) {
    for (const e of m.room.expenses) {
      const name = e.category?.name ?? "Other";
      expenseCatMap.set(name, (expenseCatMap.get(name) ?? 0) + e.amount);
    }
  }
  const incomeCatMap = new Map<string, number>();
  for (const i of incomes) {
    const name = i.category?.name ?? "Other";
    incomeCatMap.set(name, (incomeCatMap.get(name) ?? 0) + i.amount);
  }

  const expenseByCategory: CategoryBreakdown[] = Array.from(expenseCatMap.entries())
    .map(([name, value], idx) => ({
      name,
      value: Math.round(value * 100) / 100,
      fill: CHART_COLORS[idx % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const incomeByCategory: CategoryBreakdown[] = Array.from(incomeCatMap.entries())
    .map(([name, value], idx) => ({
      name,
      value: Math.round(value * 100) / 100,
      fill: CHART_COLORS[idx % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  return {
    totalIncome,
    totalExpense,
    savings: totalIncome - totalExpense,
    monthlyData,
    expenseByCategory,
    incomeByCategory,
  };
}
