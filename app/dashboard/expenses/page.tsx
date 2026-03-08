import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  let expenses: {
    id: string;
    title: string;
    amount: number;
    date: Date;
    category: { name: string } | null;
    room: { id: string; roomName: string; currency: string };
    paidBy: { name: string | null; email: string };
  }[] = [];
  let totalBalance = 0;
  let dbError = false;

  try {
    const memberships = await db.roomMember.findMany({
      where: { userId: session?.user?.id },
      include: {
        room: {
          include: {
            expenses: {
              orderBy: { date: "desc" },
              include: {
                paidBy: true,
                category: true,
                participants: true,
              },
            },
          },
        },
      },
    });

    expenses = memberships.flatMap((m) =>
      m.room.expenses.map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        date: e.date,
        category: e.category,
        room: {
          id: m.room.id,
          roomName: m.room.roomName,
          currency: m.room.currency || "USD",
        },
        paidBy: e.paidBy,
      }))
    );
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const m of memberships) {
      let net = 0;
      for (const e of m.room.expenses) {
        const participants = (e as { participants?: { userId: string; amountOwed: number }[] }).participants ?? [];
        const share = participants.find((p) => p.userId === session?.user?.id)?.amountOwed ?? 0;
        if (e.paidById === session?.user?.id) net += e.amount;
        net -= share;
      }
      totalBalance += net;
    }
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    dbError = true;
  }

  const sym = (c: string) => (c === "INR" ? "₹" : c === "EUR" ? "€" : c === "GBP" ? "£" : "$");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Expenses
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Track shared bills, payments, and balances with your roommates.
        </p>
      </div>

      {dbError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="font-medium text-destructive">Database connection error</p>
          <p className="mt-1 text-base text-muted-foreground">Please refresh the page.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Your balance</CardTitle>
            <CardDescription className="text-base">
              Net amount you owe or are owed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold ${
                totalBalance > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : totalBalance < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
              }`}
            >
              ${Math.abs(totalBalance).toFixed(2)}
              {totalBalance !== 0 && (totalBalance > 0 ? " owed to you" : " you owe")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">All expenses</CardTitle>
          <CardDescription className="text-base">
            Every expense across your rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">No expenses yet</h3>
              <p className="mt-2 max-w-sm text-base text-muted-foreground">
                Add expenses in your rooms to see them here.
              </p>
              <Link
                href="/dashboard/rooms"
                className="mt-4 text-base font-medium text-primary hover:underline"
              >
                Go to rooms →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-2 min-w-[280px]">
                {expenses.map((e) => (
                  <Link
                    key={e.id}
                    href={`/dashboard/rooms/${e.room.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground text-base">{e.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {e.room.roomName} • {e.paidBy.name || e.paidBy.email} •{" "}
                        {new Date(e.date).toLocaleDateString()}
                        {e.category && ` • ${e.category.name}`}
                      </p>
                    </div>
                    <p className="font-semibold text-base shrink-0">
                      {sym(e.room.currency)}
                      {e.amount.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
