import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPersonalExpenses } from "@/app/actions/personal-expenses";
import { getBudgetStatus } from "@/app/actions/user-budgets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Scale, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { QuickAddExpenseButton } from "@/components/dashboard/quick-add-expense-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get user's rooms
  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: {
      room: {
        include: {
          expenses: {
            orderBy: { date: "desc" },
            take: 5,
            include: {
              paidBy: true,
              category: true,
            },
          },
          _count: { select: { members: true } },
        },
      },
    },
  });

  // Get personal expenses
  const personalExpenses = await getPersonalExpenses();

  // Get budget status
  const budgetStatus = await getBudgetStatus();

  // Calculate totals
  const totalRoomExpenses = memberships.reduce(
    (sum, m) => sum + m.room.expenses.reduce((roomSum, e) => roomSum + e.amount, 0),
    0
  );
  const totalPersonalExpenses = personalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalRoomExpenses + totalPersonalExpenses;

  // Calculate balances
  const balances = memberships.map((membership) => {
    const room = membership.room;
    let net = 0;
    for (const expense of room.expenses) {
      if (expense.paidById === session.user!.id) net += expense.amount;
      // This is simplified - in real implementation you'd calculate based on participants
    }
    return {
      roomId: room.id,
      roomName: room.roomName,
      currency: room.currency || "USD",
      net: Math.round(net * 100) / 100,
    };
  });

  const recentExpenses = [
    ...personalExpenses.slice(0, 3).map((e) => ({
      ...e,
      type: "personal" as const,
      roomName: "Personal",
    })),
    ...memberships.flatMap((m) =>
      m.room.expenses.slice(0, 3).map((e) => ({
        ...e,
        type: "room" as const,
        roomName: m.room.roomName,
      }))
    ),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <QuickAddExpenseButton />
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Welcome back! Here's your expense overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalPersonalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Daily spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberships.length}</div>
            <p className="text-xs text-muted-foreground">
              Shared spaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetStatus ? (
                <span className={budgetStatus.isOverBudget ? "text-red-600" : budgetStatus.isNearLimit ? "text-yellow-600" : "text-green-600"}>
                  ${budgetStatus.remaining.toFixed(2)}
                </span>
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetStatus ? "Remaining" : "No budget"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/personal-expenses">
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span>Add Personal Expense</span>
                </div>
                <span className="text-sm text-muted-foreground">→</span>
              </div>
            </Link>
            <Link href="/dashboard/rooms">
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Manage Rooms</span>
                </div>
                <span className="text-sm text-muted-foreground">→</span>
              </div>
            </Link>
            <Link href="/dashboard/budgets">
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-5 w-5 text-purple-600" />
                  <span>Set Budget</span>
                </div>
                <span className="text-sm text-muted-foreground">→</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent expenses</p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${expense.type === 'personal' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-sm font-medium">
                          {expense.type === 'personal' ? (expense.note || 'Personal expense') : expense.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {expense.roomName} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">
                      ${expense.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balance Overview */}
      {balances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Balances</CardTitle>
            <CardDescription>Your current balance in each room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {balances.map((balance) => (
                <div key={balance.roomId} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{balance.roomName}</p>
                    <p className="text-sm text-muted-foreground">Current balance</p>
                  </div>
                  <span className={`text-lg font-semibold ${balance.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {balance.net >= 0 ? '+' : ''}{balance.currency} {balance.net.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
