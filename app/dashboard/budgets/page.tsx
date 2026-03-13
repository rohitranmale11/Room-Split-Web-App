import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBudgetStatus } from "@/app/actions/user-budgets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddUserBudgetForm } from "./add-user-budget-form";
import { PiggyBank, AlertTriangle, TrendingDown } from "lucide-react";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const budgetStatus = await getBudgetStatus();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Budgets</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Set and track your monthly spending limits.
        </p>
      </div>

      {/* Current Month Budget Status */}
      {budgetStatus ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Current Month Budget
            </CardTitle>
            <CardDescription>
              Your spending progress for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${budgetStatus.budget.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Budget</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    ${budgetStatus.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Spent</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${budgetStatus.isOverBudget ? 'text-red-600' : budgetStatus.isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                    ${budgetStatus.remaining.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Usage</span>
                  <span className={budgetStatus.isOverBudget ? 'text-red-600' : budgetStatus.isNearLimit ? 'text-yellow-600' : 'text-green-600'}>
                    {budgetStatus.percentageUsed.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budgetStatus.isOverBudget ? 'bg-red-600' : budgetStatus.isNearLimit ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
                  />
                </div>
              </div>

              {/* Warning */}
              {budgetStatus.isNearLimit && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    You've used {budgetStatus.percentageUsed.toFixed(1)}% of your budget. Keep an eye on your spending!
                  </p>
                </div>
              )}

              {budgetStatus.isOverBudget && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    You've exceeded your budget by ${Math.abs(budgetStatus.remaining).toFixed(2)}!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              No Budget Set
            </CardTitle>
            <CardDescription>
              Set a monthly budget to track your spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              You haven't set a budget for this month yet. Create one below to start tracking your spending.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Budget Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {budgetStatus ? "Update Budget" : "Set Budget"}
          </CardTitle>
          <CardDescription>
            {budgetStatus ? "Adjust your monthly spending limit" : "Create your monthly budget"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddUserBudgetForm currentBudget={budgetStatus?.budget} />
        </CardContent>
      </Card>
    </div>
  );
}
