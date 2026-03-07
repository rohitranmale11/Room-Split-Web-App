import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Receipt } from "lucide-react";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  let expenses = [];
  let dbError = false;

  try {
    // Placeholder query for when expenses table is added
    // expenses = await db.expense.findMany({ where: { userId: session?.user?.id } });
    await db.user.findUnique({ where: { id: session?.user?.id as string } });
  } catch (error) {
    console.error("Failed to fetch expenses from database:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <p className="text-muted-foreground">
          Track shared bills, payments, and balances with your roommates.
        </p>
      </div>

      {dbError && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Database Connection Error</p>
          <p className="text-sm mt-1">We couldn&apos;t load your expenses data. Please check your connection or try refreshing.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              You owe nothing right now.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-slate-100 p-3 mb-4">
            <Receipt className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium">Coming Soon</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            The expenses feature is under construction. Soon you&apos;ll be able to add bills and split them automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
