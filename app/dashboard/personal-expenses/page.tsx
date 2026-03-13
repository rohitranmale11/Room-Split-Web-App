import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPersonalExpenses } from "@/app/actions/personal-expenses";
import { getCategoriesForRoom } from "@/app/actions/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPersonalExpenseForm } from "./add-personal-expense-form";
import { Receipt } from "lucide-react";
import { format } from "date-fns";

export default async function PersonalExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const [expenses, categories] = await Promise.all([
    getPersonalExpenses(),
    getCategoriesForRoom(null, "expense"),
  ]);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Personal Expenses
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Track your daily personal expenses and spending habits.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Total personal expenses</CardTitle>
          <CardDescription className="text-base">Sum of all your personal expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
            ${total.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Add personal expense</CardTitle>
          <CardDescription className="text-base">
            Log your daily expenses like food, transport, shopping, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddPersonalExpenseForm categories={categories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent expenses</CardTitle>
          <CardDescription className="text-base">Your latest personal expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="py-6 text-center text-base text-muted-foreground">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.note || "Personal expense"}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category?.name || "Uncategorized"} • {format(new Date(expense.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    ${expense.amount.toFixed(2)}
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
