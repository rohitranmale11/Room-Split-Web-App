import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCategoriesForRoom } from "@/app/actions/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddBudgetForm } from "./add-budget-form";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const [budgets, expenseCategories] = await Promise.all([
    db.budget.findMany({
      where: { userId: session.user.id },
      include: { category: true },
    }),
    getCategoriesForRoom(null, "expense"),
  ]);

  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: {
      room: { include: { expenses: { include: { category: true } } } },
    },
  });

  const spentByCategory = new Map<string, number>();
  for (const m of memberships) {
    for (const e of m.room.expenses) {
      if (e.categoryId) {
        spentByCategory.set(
          e.categoryId,
          (spentByCategory.get(e.categoryId) ?? 0) + e.amount
        );
      }
    }
  }

  const budgetsWithSpent = budgets.map((b) => ({
    ...b,
    spent: spentByCategory.get(b.categoryId) ?? 0,
    exceeded: (spentByCategory.get(b.categoryId) ?? 0) > b.amount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Budgets</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Set spending limits and get alerts when you exceed them.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Set budget</CardTitle>
          <CardDescription className="text-base">
            Choose a category and your monthly limit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddBudgetForm categories={expenseCategories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Your budgets</CardTitle>
          <CardDescription className="text-base">
            Track spending against your limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetsWithSpent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium text-foreground">No budgets set</h3>
              <p className="mt-2 max-w-sm text-base text-muted-foreground">
                Set a budget above to start tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgetsWithSpent.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-lg border px-4 py-3 ${
                    b.exceeded
                      ? "border-rose-500/50 bg-rose-500/10 dark:bg-rose-500/10"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-base">{b.category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${b.spent.toFixed(2)} / ${b.amount.toFixed(2)} spent
                      </p>
                    </div>
                    {b.exceeded && (
                      <span className="rounded-full bg-rose-500/20 px-2 py-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                        Exceeded
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
