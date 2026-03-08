import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, Home, Receipt, TrendingUp, Wallet } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  let roomsCount = 0;
  let totalExpenses = 0;
  let totalIncome = 0;
  let pendingBalance = 0;
  let membersCount = 0;
  let recentExpenses: {
    id: string;
    title: string;
    amount: number;
    date: Date;
    room: { id: string; roomName: string; currency: string };
    paidBy: { name: string | null };
  }[] = [];
  let myRooms: { id: string; roomName: string }[] = [];
  let dbError = false;

  try {
    const memberships = await db.roomMember.findMany({
      where: { userId: session?.user?.id },
      include: {
        room: {
          include: {
            _count: { select: { members: true } },
            expenses: {
              include: {
                participants: true,
                paidBy: true,
              },
            },
            settlements: true,
          },
        },
      },
    });

    roomsCount = memberships.length;
    membersCount = memberships.reduce((s, m) => s + m.room._count.members, 0);

    if (session?.user?.id) {
      const incomes = await db.income.findMany({
        where: { userId: session.user.id },
      });
      totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    }

    for (const m of memberships) {
      const room = m.room;
      totalExpenses += room.expenses.reduce((s, e) => s + e.amount, 0);

      let net = 0;
      for (const e of room.expenses) {
        const share = e.participants.find((p) => p.userId === session?.user?.id)?.amountOwed ?? 0;
        if (e.paidBy.id === session?.user?.id) net += e.amount;
        net -= share;
      }
      for (const s of room.settlements) {
        if (s.fromUserId === session?.user?.id) net += s.amount;
        if (s.toUserId === session?.user?.id) net -= s.amount;
      }
      pendingBalance += net;

      myRooms.push({ id: room.id, roomName: room.roomName });
    }

    const allExpenses = memberships.flatMap((m) =>
      m.room.expenses.map((e) => ({
        ...e,
        room: m.room,
      }))
    );
    allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentExpenses = allExpenses.slice(0, 5).map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      date: e.date,
      room: { id: e.room.id, roomName: e.room.roomName, currency: e.room.currency || "USD" },
      paidBy: e.paidBy,
    }));
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    dbError = true;
  }

  const sym = (c: string) => (c === "INR" ? "₹" : c === "EUR" ? "€" : c === "GBP" ? "£" : "$");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}. Here&apos;s an overview of your rooms.
        </p>
      </div>

      {dbError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="font-medium text-destructive">Database connection error</p>
          <p className="mt-1 text-base text-muted-foreground">
            We couldn&apos;t load your data. Please refresh the page.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total income</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">${totalIncome.toFixed(2)}</div>
            <p className="mt-1 text-base text-muted-foreground">Personal income tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total expenses</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">${totalExpenses.toFixed(2)}</div>
            <p className="mt-1 text-base text-muted-foreground">Across all your rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total savings</CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-semibold ${
                totalIncome - totalExpenses >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              ${(totalIncome - totalExpenses).toFixed(2)}
            </div>
            <p className="mt-1 text-base text-muted-foreground">Income − Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Pending balance</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-semibold ${
                pendingBalance > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : pendingBalance < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
              }`}
            >
              ${Math.abs(pendingBalance).toFixed(2)}
              {pendingBalance !== 0 && (pendingBalance > 0 ? " owed to you" : " you owe")}
            </div>
            <p className="mt-1 text-base text-muted-foreground">Your net position</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Active rooms</CardTitle>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{roomsCount}</div>
            <p className="mt-1 text-base text-muted-foreground">Rooms you&apos;re in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Members</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-foreground">{membersCount}</div>
            <p className="mt-1 text-base text-muted-foreground">Across all rooms</p>
          </CardContent>
        </Card>
      </div>

      {/* Main panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent expenses</CardTitle>
            <CardDescription className="text-base">
              Latest expenses across your rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <p className="py-8 text-center text-base text-muted-foreground">
                No expenses yet. Add expenses in your rooms.
              </p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((e) => (
                  <Link
                    key={e.id}
                    href={`/dashboard/rooms/${e.room.id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground text-base">{e.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {e.room.roomName} • {e.paidBy.name || "Someone"} •{" "}
                        {new Date(e.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold text-base">
                      {sym(e.room.currency)}
                      {e.amount.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/expenses"
              className="mt-4 block text-center text-base font-medium text-primary hover:underline"
            >
              View all expenses →
            </Link>
          </CardContent>
        </Card>

        {/* Room list & activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Your rooms</CardTitle>
              <CardDescription className="text-base">
                Quick access to your shared spaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myRooms.length === 0 ? (
                <p className="py-8 text-center text-base text-muted-foreground">
                  No rooms yet. Create or join a room.
                </p>
              ) : (
                <div className="space-y-2">
                  {myRooms.map((r) => (
                    <Link
                      key={r.id}
                      href={`/dashboard/rooms/${r.id}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground text-base">{r.roomName}</span>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/dashboard/rooms"
                className="mt-4 block text-center text-base font-medium text-primary hover:underline"
              >
                Manage rooms →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Activity feed</CardTitle>
              <CardDescription className="text-base">
                Recent activity across your rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <p className="py-8 text-center text-base text-muted-foreground">
                  No recent activity.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentExpenses.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-base"
                    >
                      <p className="text-foreground">
                        <span className="font-medium">{e.paidBy.name || "Someone"}</span> added{" "}
                        <span className="font-medium">{e.title}</span> in {e.room.roomName}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {new Date(e.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/dashboard/activity"
                className="mt-4 block text-center text-base font-medium text-primary hover:underline"
              >
                View all activity →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
