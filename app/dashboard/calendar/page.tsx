import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPersonalExpenses } from "@/app/actions/personal-expenses";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Get first and last day of current month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // Get personal expenses for current month
  const personalExpenses = await getPersonalExpensesByMonth(currentYear, currentMonth + 1);

  // Get room expenses for current month
  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: {
      room: {
        include: {
          expenses: {
            where: {
              date: {
                gte: firstDay,
                lte: lastDay,
              },
            },
            include: {
              paidBy: true,
              category: true,
            },
            orderBy: { date: "desc" },
          },
        },
      },
    },
  });

  const roomExpenses = memberships.flatMap(m =>
    m.room.expenses.map(e => ({
      ...e,
      type: "room" as const,
      roomName: m.room.roomName,
    }))
  );

  // Combine all expenses
  const allExpenses = [...personalExpenses.map(e => ({ ...e, type: "personal" as const, roomName: "Personal" })), ...roomExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group expenses by date
  const expensesByDate = new Map<string, typeof allExpenses>();
  allExpenses.forEach(expense => {
    const dateKey = new Date(expense.date).toISOString().split('T')[0];
    if (!expensesByDate.has(dateKey)) {
      expensesByDate.set(dateKey, []);
    }
    expensesByDate.get(dateKey)!.push(expense);
  });

  // Calculate daily totals
  const dailyTotals = new Map<string, number>();
  expensesByDate.forEach((expenses, date) => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    dailyTotals.set(date, total);
  });

  // Generate calendar days
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toISOString().split('T')[0];
    const expenses = expensesByDate.get(dateKey) || [];
    const total = dailyTotals.get(dateKey) || 0;

    calendarDays.push({
      date,
      dateKey,
      day,
      expenses,
      total,
      isToday: date.toDateString() === now.toDateString(),
    });
  }

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const totalMonthlySpending = Array.from(dailyTotals.values()).reduce((sum, total) => sum + total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Expense Calendar
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          View your daily expenses for {monthName}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalMonthlySpending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spending this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days with Expenses</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyTotals.size}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {daysInMonth} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dailyTotals.size > 0 ? (totalMonthlySpending / dailyTotals.size).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per spending day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{monthName}</CardTitle>
          <CardDescription>
            Click on any day to see detailed expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "min-h-[80px] p-2 border rounded-lg",
                  day ? "hover:bg-accent cursor-pointer" : "",
                  day?.isToday ? "border-blue-500 bg-blue-50" : "border-border"
                )}
              >
                {day && (
                  <div className="h-full flex flex-col">
                    <div className="text-sm font-medium mb-1">{day.day}</div>
                    {day.total > 0 && (
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-red-600">
                          ${day.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.expenses.length} expense{day.expenses.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Expenses</CardTitle>
          <CardDescription>
            Latest expenses from this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {allExpenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${expense.type === 'personal' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="font-medium">
                        {expense.type === 'personal' ? (expense.note || 'Personal expense') : expense.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {expense.roomName} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    ${expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get personal expenses by month
async function getPersonalExpensesByMonth(year: number, month: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const expenses = await db.personalExpense.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "desc" },
    include: {
      category: true,
    },
  });

  return expenses;
}
