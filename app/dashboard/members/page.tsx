import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  let members: { id: string; name: string | null; email: string; rooms: string[] }[] = [];
  let dbError = false;

  try {
    const memberships = await db.roomMember.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const map = new Map<string, { id: string; name: string | null; email: string; rooms: Set<string> }>();

    for (const membership of memberships) {
      const room = membership.room;
      for (const m of room.members) {
        if (m.userId === session.user.id) continue;
        if (!map.has(m.userId)) {
          map.set(m.userId, {
            id: m.userId,
            name: m.user.name,
            email: m.user.email,
            rooms: new Set(),
          });
        }
        map.get(m.userId)!.rooms.add(room.roomName);
      }
    }

    members = Array.from(map.values()).map((entry) => ({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      rooms: Array.from(entry.rooms),
    }));
  } catch (error) {
    console.error("Failed to load members:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Members</h2>
        <p className="text-sm text-slate-600">
          Everyone you share rooms and expenses with, across all of your spaces.
        </p>
      </div>

      {dbError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          We couldn&apos;t load your members. Please try refreshing the page.
        </div>
      )}

      <Card className="border-slate-200/80 bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Your roommate network</CardTitle>
          <CardDescription className="text-xs text-slate-600">
            A unified view across rooms. Use this list to understand who you&apos;re splitting with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">
              Invite roommates to your rooms to see them listed here.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {(member.name || member.email)
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-slate-900">
                        {member.name || "Unknown Roommate"}
                      </p>
                      <p className="text-[11px] text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <p className="max-w-xs truncate text-right text-[11px] text-slate-500">
                    {member.rooms.join(", ")}
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

