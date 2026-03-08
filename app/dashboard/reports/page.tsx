import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMonthlyReport, getCategoryReport, getRoomReport } from "@/app/actions/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const [monthlyReport, categoryReport, roomReport] = await Promise.all([
    getMonthlyReport(),
    getCategoryReport(),
    getRoomReport(),
  ]);

  const sym = (c: string) => (c === "INR" ? "₹" : c === "EUR" ? "€" : c === "GBP" ? "£" : "$");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Reports</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Monthly, category, and room expense reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Monthly report</CardTitle>
            <CardDescription className="text-base">
              Expense and income by month for this year
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyReport.expenses.length === 0 && monthlyReport.income.length === 0 ? (
              <p className="py-6 text-center text-base text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const key = `${new Date().getFullYear()}-${String(m).padStart(2, "0")}`;
                  const exp = monthlyReport.expenses.find((x) => x.month === key);
                  const inc = monthlyReport.income.find((x) => x.month === key);
                  const monthName = new Date(key + "-01").toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2"
                    >
                      <span className="text-base text-foreground">{monthName}</span>
                      <span className="text-sm text-muted-foreground">
                        <span className="text-rose-600 dark:text-rose-400">
                          -${(exp?.amount ?? 0).toFixed(2)}
                        </span>
                        {" / "}
                        <span className="text-emerald-600 dark:text-emerald-400">
                          +${(inc?.amount ?? 0).toFixed(2)}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Category report</CardTitle>
            <CardDescription className="text-base">
              Total spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryReport.length === 0 ? (
              <p className="py-6 text-center text-base text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2">
                {categoryReport.map((r) => (
                  <div
                    key={r.category}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2"
                  >
                    <span className="text-base text-foreground">{r.category}</span>
                    <span className="font-medium">${r.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Room expense report</CardTitle>
          <CardDescription className="text-base">
            Total expenses per room
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roomReport.length === 0 ? (
            <p className="py-6 text-center text-base text-muted-foreground">No rooms yet</p>
          ) : (
            <div className="space-y-2">
              {roomReport.map((r) => (
                <a
                  key={r.roomId}
                  href={`/dashboard/rooms/${r.roomId}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium text-foreground text-base">{r.roomName}</span>
                  <span className="font-semibold">
                    {sym(r.currency)}
                    {r.totalExpense.toFixed(2)}
                  </span>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
