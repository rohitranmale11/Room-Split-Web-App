"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getActivitiesForUser(limit = 20) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    select: { roomId: true },
  });
  const roomIds = memberships.map((m) => m.roomId);

  const activities = await db.activity.findMany({
    where: { roomId: { in: roomIds } },
    include: {
      user: { select: { name: true } },
      room: { select: { roomName: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities;
}
