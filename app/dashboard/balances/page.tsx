import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default async function BalancesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  let perRoom: { roomId: string; roomName: string; currency: string; net: number }[] = [];
  let dbError = false;

  try {
    const memberships = await db.roomMember.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          include: {
            expenses: { include: { participants: true } },
            settlements: true,
          },
        },
      },
    });

    perRoom = memberships.map((membership) => {
      const room = membership.room;
      let net = 0;
      for (const expense of room.expenses) {
        if (expense.paidById === session.user!.id) net += expense.amount;
        const share = expense.participants.find((p) => p.userId === session.user!.id)?.amountOwed ?? 0;
        net -= share;
      }
      for (const s of room.settlements) {
        if (s.fromUserId === session.user!.id) net += s.amount;
        if (s.toUserId === session.user!.id) net -= s.amount;
      }
      return {
        roomId: room.id,
        roomName: room.roomName,
        currency: room.currency || "USD",
        net: Math.round(net * 100) / 100,
      };
    });
  } catch (error) {
    console.error("Failed to compute balances:", error);
    dbError = true;
  }

  const sym = (c: string) => (c === "INR" ? "₹" : c === "EUR" ? "€" : c === "GBP" ? "£" : "$");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Balances
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          See how much you owe or are owed across your rooms.
        </p>
      </div>

      {dbError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="font-medium text-destructive">Database connection error</p>
          <p className="mt-1 text-base text-muted-foreground">Please refresh the page.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {perRoom.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-base text-muted-foreground">
                You don&apos;t have any balances yet. Add expenses in your rooms to see who owes who.
              </p>
              <Link
                href="/dashboard/rooms"
                className="mt-4 inline-block text-base font-medium text-primary hover:underline"
              >
                Go to rooms →
              </Link>
            </CardContent>
          </Card>
        ) : (
          perRoom.map((item) => {
            const positive = item.net > 0;
            const negative = item.net < 0;
            const status = positive ? "You are owed" : negative ? "You owe" : "Settled";

            return (
              <Link key={item.roomId} href={`/dashboard/rooms/${item.roomId}`}>
                <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">{item.roomName}</CardTitle>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{status} in this room</p>
                    <p
                      className={`mt-1 text-2xl font-semibold ${
                        positive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : negative
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-foreground"
                      }`}
                    >
                      {item.net === 0
                        ? `${sym(item.currency)}0.00`
                        : `${item.net > 0 ? "+" : "-"}${sym(item.currency)}${Math.abs(item.net).toFixed(2)}`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
