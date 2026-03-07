import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-700/70 ${className}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-slate-200/80">
            <CardHeader className="space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <SkeletonBlock className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-slate-200/80">
        <CardContent className="space-y-3 py-5">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
        </CardContent>
      </Card>
    </div>
  );
}

