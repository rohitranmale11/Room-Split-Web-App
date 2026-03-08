import { db } from "@/lib/db";

export type ActivityType =
  | "MEMBER_JOINED"
  | "ROOM_CREATED"
  | "EXPENSE_ADDED"
  | "EXPENSE_DELETED"
  | "SETTLEMENT_COMPLETED"
  | "BUDGET_EXCEEDED";

export async function createActivity(
  type: ActivityType,
  userId: string,
  metadata: Record<string, unknown>,
  roomId?: string | null
) {
  await db.activity.create({
    data: {
      type,
      userId,
      roomId: roomId || undefined,
      metadata: metadata as object,
    },
  });
}
