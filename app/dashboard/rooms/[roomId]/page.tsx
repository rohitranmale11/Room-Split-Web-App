import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCategoriesForRoom } from "@/app/actions/categories";
import { RoomDetail } from "@/components/dashboard/room-detail";

interface RoomDetailPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const room = await db.room.findUnique({
    where: { id: roomId },
    include: {
      members: { include: { user: true } },
      expenses: {
        orderBy: { date: "desc" },
        include: {
          paidBy: true,
          category: true,
          participants: { include: { user: true } },
        },
      },
      settlements: {
        include: { fromUser: true, toUser: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!room) notFound();

  const isMember = room.members.some((m) => m.userId === session.user.id);
  if (!isMember) notFound();

  const categories = await getCategoriesForRoom(roomId);

  return (
    <RoomDetail
      room={room}
      categories={categories}
      currentUserId={session.user.id}
    />
  );
}
