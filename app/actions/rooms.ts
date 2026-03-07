"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRoom(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const roomName = formData.get("roomName") as string;
  
  if (!roomName) {
    throw new Error("Room name is required");
  }

  const room = await prisma.room.create({
    data: {
      roomName,
      createdBy: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "admin",
        }
      }
    }
  });

  revalidatePath("/dashboard/rooms");
  return { success: true, room };
}

export async function joinRoom(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const inviteCode = formData.get("inviteCode") as string;
  
  if (!inviteCode) {
    throw new Error("Invite code is required");
  }

  const room = await prisma.room.findUnique({
    where: { inviteCode }
  });

  if (!room) {
    throw new Error("Invalid invite code");
  }

  try {
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        role: "member",
      }
    });

    revalidatePath("/dashboard/rooms");
    return { success: true, room };
  } catch {
    throw new Error("You are already a member of this room");
  }
}
