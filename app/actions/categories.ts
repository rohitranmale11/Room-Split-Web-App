"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCategoriesForRoom(roomId: string | null, type: "expense" | "income" = "expense") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const defaults = await db.category.findMany({
    where: { roomId: null, type },
    orderBy: { name: "asc" },
  });

  if (!roomId || type === "income") return defaults;

  const roomSpecific = await db.category.findMany({
    where: { roomId, type: "expense" },
    orderBy: { name: "asc" },
  });

  const seen = new Set(defaults.map((c) => c.name.toLowerCase()));
  const merged = [...defaults];
  for (const c of roomSpecific) {
    if (!seen.has(c.name.toLowerCase())) {
      seen.add(c.name.toLowerCase());
      merged.push(c);
    }
  }
  merged.sort((a, b) => a.name.localeCompare(b.name));
  return merged;
}

export async function getIncomeCategories() {
  return getCategoriesForRoom(null, "income");
}

export async function createCustomCategory(roomId: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const membership = await db.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership) throw new Error("You are not a member of this room");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name is required");

  const existing = await db.category.findFirst({
    where: {
      OR: [
        { roomId: null, name: { equals: trimmed, mode: "insensitive" } },
        { roomId, name: { equals: trimmed, mode: "insensitive" } },
      ],
    },
  });
  if (existing) throw new Error("Category already exists");

  await db.category.create({
    data: { name: trimmed, type: "expense", roomId },
  });

  revalidatePath(`/dashboard/rooms/${roomId}`);
  return { success: true };
}
