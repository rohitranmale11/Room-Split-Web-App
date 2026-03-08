"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";

export async function createSettlement(roomId: string, toUserId: string, amountRaw: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

  const membership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership) throw new Error("You are not a member of this room");

  const toMember = await db.roomMember.findFirst({
    where: { roomId, userId: toUserId },
  });
  if (!toMember) throw new Error("Recipient not found in this room");

  if (toUserId === session.user.id) throw new Error("You cannot settle with yourself");

  const [room, toUser] = await Promise.all([
    db.room.findUnique({ where: { id: roomId } }),
    db.user.findUnique({ where: { id: toUserId } }),
  ]);

  await db.settlement.create({
    data: {
      roomId,
      fromUserId: session.user.id,
      toUserId,
      amount,
    },
  });

  await createActivity(
    "SETTLEMENT_COMPLETED",
    session.user.id,
    {
      amount,
      toUserName: toUser?.name ?? "Someone",
      roomName: room?.roomName,
    },
    roomId
  );

  revalidatePath(`/dashboard/rooms/${roomId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/balances");
  return { success: true };
}
