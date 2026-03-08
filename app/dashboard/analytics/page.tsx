import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsData } from "@/app/actions/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Analytics
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          High-level view of your spending and income patterns.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              ${data.totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              ${data.totalExpense.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-base font-medium">Savings</CardTitle>
  </CardHeader>
  <CardContent>
    <p
      className={`text-2xl font-semibold ${
        (data.savings ?? 0) >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      }`}
    >
      ${(data.savings ?? 0).toFixed(2)}
    </p>
  </CardContent>
</Card>
      </div>

      <AnalyticsCharts
        monthlyData={data.monthlyData}
        expenseByCategory={data.expenseByCategory}
        incomeByCategory={data.incomeByCategory}
      />
    </div>
  );
}
