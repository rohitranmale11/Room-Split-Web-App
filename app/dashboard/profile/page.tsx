import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  let user = null;
  let dbError = false;

  try {
    user = await db.user.findUnique({
      where: { id: session?.user?.id as string },
    });
  } catch (error) {
    console.error("Failed to fetch user profile from database:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Card className="p-6 border-red-200 bg-red-50 text-red-900 border-dashed text-center mt-8">
          <h3 className="text-lg font-bold">Database Connection Error</h3>
          <p className="text-red-700 mt-2">
            We couldn't reach the database server. If the database was sleeping, it may take a few seconds to wake up. Please refresh the page.
          </p>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          View and edit your personal information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            This information is visible to your roommates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="text-xl">
                {user.name?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none mb-1">Avatar</p>
              <p className="text-sm text-muted-foreground">
                Currently pulled from Google (if joined via OAuth).
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joined">Member Since</Label>
            <Input id="joined" defaultValue={new Date(user.createdAt).toLocaleDateString()} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
