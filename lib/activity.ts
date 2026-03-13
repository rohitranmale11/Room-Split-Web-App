import { db } from "@/lib/db";

export type ActivityType =
  | "MEMBER_JOINED"
  | "ROOM_CREATED"
  | "EXPENSE_ADDED"
  | "EXPENSE_DELETED"
  | "SETTLEMENT_COMPLETED"
  | "BUDGET_EXCEEDED"
  | "CONTACT_ADDED"
  | "CONTACT_UPDATED"
  | "CONTACT_DELETED"
  | "PERSONAL_EXPENSE_ADDED"
  | "PERSONAL_EXPENSE_UPDATED"
  | "PERSONAL_EXPENSE_DELETED"
  | "BUDGET_CREATED"
  | "BUDGET_UPDATED";

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
