"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeRoomBalances } from "@/lib/balances";

export async function getRoomBalances(roomId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const { db } = await import("@/lib/db");
  const membership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership) return [];

  return computeRoomBalances(roomId);
}
