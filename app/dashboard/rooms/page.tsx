import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateRoomForm } from "./create-room-form";
import { JoinRoomForm } from "./join-room-form";
import { CopyButton } from "./copy-button";
import { ChevronRight } from "lucide-react";

export default async function RoomsPage() {
  const session = await getServerSession(authOptions);

  let myRooms: {
    room: {
      id: string;
      roomName: string;
      description: string | null;
      currency: string;
      inviteCode: string;
      _count: { members: number };
    };
    role: string;
  }[] = [];
  let dbError = false;

  try {
    myRooms = await db.roomMember.findMany({
      where: { userId: session?.user?.id },
      include: {
        room: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch rooms from database:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Rooms</h2>
          <p className="mt-1 text-base text-muted-foreground">
            Manage your shared rooms and flatmates.
          </p>
        </div>
        <div className="flex gap-2">
          <JoinRoomForm />
          <CreateRoomForm />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dbError ? (
          <Card className="col-span-full border-destructive/50 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center py-0">
              <h3 className="text-lg font-semibold text-destructive">Database connection error</h3>
              <p className="mt-2 max-w-md text-base text-muted-foreground">
                We couldn&apos;t reach the database. Please refresh the page.
              </p>
            </CardContent>
          </Card>
        ) : myRooms.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-medium text-foreground">No rooms yet</h3>
              <p className="mt-2 max-w-sm text-base text-muted-foreground">
                Create a new room or join an existing one using an invite code.
              </p>
              <div className="mt-4 flex gap-2">
                <JoinRoomForm />
                <CreateRoomForm />
              </div>
            </CardContent>
          </Card>
        ) : (
          myRooms.map((membership) => (
            <Link key={membership.room.id} href={`/dashboard/rooms/${membership.room.id}`}>
              <Card className="flex h-full flex-col justify-between transition-colors hover:border-primary/50 hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {membership.room.roomName}
                      </CardTitle>
                      <CardDescription className="mt-1 text-base">
                        {membership.room._count.members} member{membership.room._count.members === 1 ? "" : "s"} •{" "}
                        <span className="capitalize">{membership.role}</span>
                      </CardDescription>
                      {membership.room.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {membership.room.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2">
                    <span className="truncate font-mono text-sm">{membership.room.inviteCode}</span>
                    <CopyButton text={membership.room.inviteCode} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
