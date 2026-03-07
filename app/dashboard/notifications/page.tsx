import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New expense added in Pune Flat",
    body: "Ananya added “Internet Bill - March” for $42.00.",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Balance updated",
    body: "Your balance in “Bangalore PG” changed after a new grocery expense.",
    time: "Yesterday",
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Notifications</h2>
        <p className="text-sm text-slate-600">
          Activity across your rooms, so you never miss an update.
        </p>
      </div>

      <Card className="border-slate-200/80 bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent updates</CardTitle>
          <CardDescription className="text-xs text-slate-600">
            This is a preview of the activity feed. In the future, this will be powered by real
            events from your rooms and expenses.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {MOCK_NOTIFICATIONS.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-xs font-medium text-slate-900">{notification.title}</p>
                <p className="mt-1 text-xs text-slate-600">{notification.body}</p>
              </div>
              <p className="shrink-0 text-[11px] text-slate-500">{notification.time}</p>
            </div>
          ))}
          {MOCK_NOTIFICATIONS.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-500">
              You&apos;re all caught up. New notifications will appear here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

