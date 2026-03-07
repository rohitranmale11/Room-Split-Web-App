import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  let userSettings = null;
  let dbError = false;

  try {
    // Validate we can connect to the DB
    userSettings = await db.user.findUnique({
      where: { id: session?.user?.id as string },
      select: { name: true, email: true }
    });
  } catch (error) {
    console.error("Failed to fetch settings from database:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {dbError && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Database Connection Error</p>
          <p className="text-sm mt-1">We couldn&apos;t load your accurate settings. Any changes made now may not save.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>
            Update your email notifications and app settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-12 flex flex-col items-center justify-center text-center border-t">
           <div className="rounded-full bg-slate-100 p-3 mb-4">
            <SettingsIcon className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium">Settings Panel Coming Soon</h3>
           <p className="text-muted-foreground mt-2 max-w-sm">
            Notification preferences and advanced account controls will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
