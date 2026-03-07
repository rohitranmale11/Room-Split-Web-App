import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RoomDetail } from "@/components/dashboard/room-detail";

interface RoomDetailPageProps {
  params: {
    roomId: string;
  };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const room = await db.room.findUnique({
    where: { id: params.roomId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      expenses: {
        orderBy: { date: "desc" },
        include: {
          paidBy: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!room) {
    notFound();
  }

  const isMember = room.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    notFound();
  }

  return (
    <RoomDetail
      room={room}
      currentUserId={session.user.id}
    />
  );
}

