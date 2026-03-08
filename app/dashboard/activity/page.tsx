import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActivitiesForUser } from "@/app/actions/activities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function formatActivityType(type: string) {
  const map: Record<string, string> = {
    MEMBER_JOINED: "joined room",
    ROOM_CREATED: "created room",
    EXPENSE_ADDED: "added expense",
    EXPENSE_DELETED: "deleted expense",
    SETTLEMENT_COMPLETED: "completed settlement",
  };
  return map[type] ?? type;
}

function formatActivityMeta(type: string, meta: Record<string, unknown> | null) {
  if (!meta) return "";
  switch (type) {
    case "MEMBER_JOINED":
      return `${meta.memberName ?? "Someone"} joined ${meta.roomName ?? "room"}`;
    case "ROOM_CREATED":
      return `Created ${meta.roomName ?? "room"}`;
    case "EXPENSE_ADDED":
      return `${meta.expenseTitle ?? "Expense"} ($${meta.amount ?? 0}) in ${meta.roomName ?? "room"}`;
    case "EXPENSE_DELETED":
      return `Deleted ${meta.expenseTitle ?? "expense"} in ${meta.roomName ?? "room"}`;
    case "SETTLEMENT_COMPLETED":
      return `Paid ${meta.toUserName ?? "someone"} $${meta.amount ?? 0} in ${meta.roomName ?? "room"}`;
    default:
      return JSON.stringify(meta);
  }
}

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const activities = await getActivitiesForUser(30);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Activity</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Recent activity across your rooms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Activity feed</CardTitle>
          <CardDescription className="text-base">
            User joined room, expense added, settlement completed, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium text-foreground">No activity yet</h3>
              <p className="mt-2 max-w-sm text-base text-muted-foreground">
                Create rooms, add expenses, or settle balances to see activity here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <p className="text-foreground text-base">
                    <span className="font-medium">{a.user.name ?? "Someone"}</span>{" "}
                    {formatActivityType(a.type)}{" "}
                    {a.room ? (
                      <Link
                        href={`/dashboard/rooms/${a.room.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {formatActivityMeta(a.type, a.metadata as Record<string, unknown> | null)}
                      </Link>
                    ) : (
                      formatActivityMeta(a.type, a.metadata as Record<string, unknown> | null)
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
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
