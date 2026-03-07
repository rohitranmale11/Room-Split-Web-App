import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BalancesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  let balances: { roomName: string; net: number }[] = [];
  let dbError = false;

  try {
    const memberships = await db.roomMember.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          include: {
            expenses: {
              include: {
                participants: true,
              },
            },
          },
        },
      },
    });

    balances = memberships.map((membership) => {
      const room = membership.room;
      let net = 0;

      for (const expense of room.expenses) {
        const share = expense.participants.find(
          (p) => p.userId === session.user!.id
        )?.amountOwed;

        if (expense.paidById === session.user!.id) {
          net += expense.amount;
        }

        if (share) {
          net -= share;
        }
      }

      return {
        roomName: room.roomName,
        net,
      };
    });
  } catch (error) {
    console.error("Failed to compute balances:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Balances</h2>
        <p className="text-sm text-slate-600">
          See how much you owe or are owed across your rooms.
        </p>
      </div>

      {dbError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          We couldn&apos;t load your balances. Please check your connection or try refreshing.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="py-10 text-center text-sm text-slate-600">
              You don&apos;t have any balances yet. Add expenses in your rooms to see who owes who.
            </CardContent>
          </Card>
        ) : (
          balances.map((item) => {
            const positive = item.net > 0;
            const negative = item.net < 0;
            const status = positive ? "You are owed" : negative ? "You owe" : "Settled";

            return (
              <Card key={item.roomName} className="border-slate-200/80 bg-white">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{item.roomName}</CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    {status} in this room
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-semibold ${
                      positive
                        ? "text-emerald-600"
                        : negative
                        ? "text-rose-600"
                        : "text-slate-900"
                    }`}
                  >
                    {item.net === 0
                      ? "$0.00"
                      : `${item.net > 0 ? "+" : "-"}$${Math.abs(item.net).toFixed(2)}`}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

