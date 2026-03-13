import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rooms = await db.roomMember.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          select: {
            id: true,
            roomName: true,
            inviteCode: true,
            currency: true,
          },
        },
      },
    });

    return Response.json({ rooms: rooms.map(m => m.room) });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return Response.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}
