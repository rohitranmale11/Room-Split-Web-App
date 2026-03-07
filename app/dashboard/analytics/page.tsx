import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  let totalExpenses = 0;
  let roomsCount = 0;
  let dbError = false;

  try {
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

    roomsCount = memberships.length;
    totalExpenses = memberships.reduce((sum, membership) => {
      const roomTotal = membership.room.expenses.reduce(
        (roomSum, expense) => roomSum + expense.amount,
        0
      );
      return sum + roomTotal;
    }, 0);
  } catch (error) {
    console.error("Failed to load analytics:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Analytics</h2>
        <p className="text-sm text-slate-600">
          High-level view of your spending patterns across rooms.
        </p>
      </div>

      {dbError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          We couldn&apos;t load your analytics. Please check your connection or try again.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Total tracked expenses</CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Sum of all expenses in rooms you&apos;re part of.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-950">
              ${totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Rooms you&apos;re in</CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Active shared spaces with tracked expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-950">{roomsCount}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Average per room</CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Approximate spend in each active room.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-950">
              {roomsCount === 0 ? "$0.00" : `$${(totalExpenses / roomsCount).toFixed(2)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Trends coming soon</CardTitle>
          <CardDescription className="text-xs text-slate-600">
            Soon you&apos;ll see charts for monthly spend, category breakdowns, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-10 text-center text-xs text-slate-500">
          Analytics are based on the expenses you add today. Start logging rent, bills, and
          groceries to unlock deeper insights.
        </CardContent>
      </Card>
    </div>
  );
}

