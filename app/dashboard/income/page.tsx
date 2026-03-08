import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getIncomeCategories } from "@/app/actions/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddIncomeForm } from "./add-income-form";

export default async function IncomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const [incomes, categories] = await Promise.all([
    db.income.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      include: { category: true },
    }),
    getIncomeCategories(),
  ]);

  const total = incomes.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Income</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Track your personal income: salary, freelance, bonuses, and more.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Total income</CardTitle>
          <CardDescription className="text-base">Sum of all logged income</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            ${total.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Add income</CardTitle>
          <CardDescription className="text-base">
            Log salary, freelance, business, rental income, or bonus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddIncomeForm categories={categories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Income history</CardTitle>
          <CardDescription className="text-base">Your recorded income entries</CardDescription>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium text-foreground">No income entries yet</h3>
              <p className="mt-2 max-w-sm text-base text-muted-foreground">
                Add your first income above to start tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {incomes.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground text-base">{i.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {i.category?.name ?? "Other"} • {new Date(i.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-base text-emerald-600 dark:text-emerald-400">
                    ${i.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
