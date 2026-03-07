import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  let roomsCount = 0;
  let dbError = false;

  try {
    roomsCount = await db.roomMember.count({
      where: {
        userId: session?.user?.id as string
      }
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data from database:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}. Here&apos;s an overview of your rooms.
        </p>
      </div>
      
      {dbError && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Database Connection Error</p>
          <p className="text-sm mt-1">We couldn&apos;t load your accurate room data. Please check your database connection or try refreshing.</p>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomsCount}</div>
            <p className="text-xs text-muted-foreground">
              Rooms you are a member of
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Your share to pay this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0</div>
            <p className="text-xs text-muted-foreground">
              New updates since last login
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
