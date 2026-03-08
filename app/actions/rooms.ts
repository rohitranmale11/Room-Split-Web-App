"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";

export async function createRoom(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("You must be logged in to create a room");

  const userId = session.user.id;

  const existingUser = await db.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new Error("Your account could not be found. Please log out and log in again.");
  }

  const roomName = (formData.get("roomName") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const currency = (formData.get("currency") as string)?.trim() || "USD";

  if (!roomName) throw new Error("Room name is required");

  const room = await db.room.create({
    data: {
      roomName,
      description: description || undefined,
      currency,
      createdBy: userId,
      members: {
        create: {
          userId,
          role: "admin",
        },
      },
    },
  });

  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard");
  return { success: true, room };
}

export async function joinRoom(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const inviteCode = (formData.get("inviteCode") as string)?.trim();
  if (!inviteCode) throw new Error("Invite code is required");

  const room = await db.room.findUnique({ where: { inviteCode } });
  if (!room) throw new Error("Invalid invite code");

  try {
    await db.roomMember.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        role: "member",
      },
    });
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    await createActivity(
      "MEMBER_JOINED",
      session.user.id,
      { roomName: room.roomName, memberName: user?.name ?? "Someone" },
      room.id
    );
    revalidatePath("/dashboard/rooms");
    revalidatePath(`/dashboard/rooms/${room.id}`);
    revalidatePath("/dashboard");
    return { success: true, room };
  } catch {
    throw new Error("You are already a member of this room");
  }
}

export async function leaveRoom(roomId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const membership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership) throw new Error("You are not a member of this room");

  const memberCount = await db.roomMember.count({ where: { roomId } });
  if (memberCount <= 1) {
    await db.room.delete({ where: { id: roomId } });
  } else {
    await db.roomMember.delete({
      where: { id: membership.id },
    });
  }

  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/rooms/${roomId}`);
  return { success: true };
}

export async function deleteRoom(roomId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const membership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership || membership.role !== "admin")
    throw new Error("Only room admins can delete the room");

  await db.room.delete({ where: { id: roomId } });

  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/rooms/${roomId}`);
  return { success: true };
}
