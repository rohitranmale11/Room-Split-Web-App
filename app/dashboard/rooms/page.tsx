import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRoomForm } from "./create-room-form";
import { JoinRoomForm } from "./join-room-form";
import { CopyButton } from "./copy-button";

export default async function RoomsPage() {
  const session = await getServerSession(authOptions);

  let myRooms: any[] = [];
  let dbError = false;

  try {
    myRooms = await db.roomMember.findMany({
      where: { userId: session?.user?.id },
      include: {
        room: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch rooms from database:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
          <p className="text-muted-foreground">
            Manage your shared rooms and flatmates.
          </p>
        </div>
        <div className="flex space-x-2">
          <JoinRoomForm />
          <CreateRoomForm />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dbError ? (
          <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center border-red-200 bg-red-50 text-red-900 border-dashed">
            <h3 className="text-lg font-bold">Database Connection Error</h3>
            <p className="text-red-700 mt-2 max-w-md">
              We couldn't reach the database server. If the database was sleeping, it may take a few seconds to wake up. Please refresh the page.
            </p>
          </Card>
        ) : myRooms.length === 0 ? (
          <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium">No rooms yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              You are not a member of any room. Create a new room or join an existing one using an invite code.
            </p>
          </Card>
        ) : (
          myRooms.map((membership: { room: { id: string; roomName: string; inviteCode: string; _count: { members: number } }; role: string }) => (
            <Card key={membership.room.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{membership.room.roomName}</CardTitle>
                <CardDescription>
                  {membership.room._count.members} Members • Role: <span className="capitalize">{membership.role}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex w-full items-center justify-between rounded-md border p-2 mt-4 bg-slate-50">
                  <span className="text-xs font-mono truncate">{membership.room.inviteCode}</span>
                  <CopyButton text={membership.room.inviteCode} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
