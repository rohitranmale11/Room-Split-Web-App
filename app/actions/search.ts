"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type SearchResult = {
  expenses: { id: string; title: string; amount: number; roomId: string; roomName: string }[];
  rooms: { id: string; roomName: string }[];
  members: { id: string; name: string | null; roomId: string; roomName: string }[];
};

export async function globalSearch(query: string): Promise<SearchResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !query?.trim()) {
    return { expenses: [], rooms: [], members: [] };
  }

  const q = query.trim().toLowerCase();
  if (q.length < 2) return { expenses: [], rooms: [], members: [] };

  const memberships = await db.roomMember.findMany({
    where: { userId: session.user.id },
    include: {
      room: {
        include: {
          members: { include: { user: true } },
          expenses: { include: { paidBy: true } },
        },
      },
    },
  });

  const roomIds = memberships.map((m) => m.roomId);
  const expenses: SearchResult["expenses"] = [];
  const rooms: SearchResult["rooms"] = [];
  const members: SearchResult["members"] = [];
  const seenExpense = new Set<string>();
  const seenRoom = new Set<string>();
  const seenMember = new Set<string>();

  for (const m of memberships) {
    const room = m.room;
    if (room.roomName.toLowerCase().includes(q) && !seenRoom.has(room.id)) {
      seenRoom.add(room.id);
      rooms.push({ id: room.id, roomName: room.roomName });
    }

    for (const expense of room.expenses) {
      if (
        (expense.title.toLowerCase().includes(q) ||
          expense.notes?.toLowerCase().includes(q)) &&
        !seenExpense.has(expense.id)
      ) {
        seenExpense.add(expense.id);
        expenses.push({
          id: expense.id,
          title: expense.title,
          amount: expense.amount,
          roomId: room.id,
          roomName: room.roomName,
        });
      }
    }

    for (const member of room.members) {
      const name = member.user.name?.toLowerCase() ?? "";
      const email = member.user.email?.toLowerCase() ?? "";
      if (
        (name.includes(q) || email.includes(q)) &&
        member.userId !== session.user.id &&
        !seenMember.has(`${room.id}-${member.userId}`)
      ) {
        seenMember.add(`${room.id}-${member.userId}`);
        members.push({
          id: member.userId,
          name: member.user.name,
          roomId: room.id,
          roomName: room.roomName,
        });
      }
    }
  }

  return {
    expenses: expenses.slice(0, 10),
    rooms: rooms.slice(0, 10),
    members: members.slice(0, 10),
  };
}
