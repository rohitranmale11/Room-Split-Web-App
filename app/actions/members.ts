"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function removeMember(roomId: string, memberUserId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const adminMembership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!adminMembership || adminMembership.role !== "admin")
    throw new Error("Only room admins can remove members");

  if (memberUserId === session.user.id)
    throw new Error("Use Leave Room to remove yourself");

  const target = await db.roomMember.findFirst({
    where: { roomId, userId: memberUserId },
  });
  if (!target) throw new Error("Member not found");

  await db.roomMember.delete({ where: { id: target.id } });

  revalidatePath(`/dashboard/rooms/${roomId}`);
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/members");
  return { success: true };
}

export async function updateMemberRole(roomId: string, memberUserId: string, role: "admin" | "member") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const adminMembership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!adminMembership || adminMembership.role !== "admin")
    throw new Error("Only room admins can change roles");

  const target = await db.roomMember.findFirst({
    where: { roomId, userId: memberUserId },
  });
  if (!target) throw new Error("Member not found");

  await db.roomMember.update({
    where: { id: target.id },
    data: { role },
  });

  revalidatePath(`/dashboard/rooms/${roomId}`);
  revalidatePath("/dashboard/rooms");
  return { success: true };
}
