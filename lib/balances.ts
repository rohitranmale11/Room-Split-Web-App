import { db } from "@/lib/db";

export type BalanceEntry = {
  fromUserId: string;
  toUserId: string;
  amount: number;
  fromUserName: string | null;
  toUserName: string | null;
  fromUserEmail: string;
  toUserEmail: string;
};

export type UserNetBalance = {
  userId: string;
  userName: string | null;
  userEmail: string;
  net: number;
};

/**
 * Compute who owes whom in a room based on expenses and settlements.
 * Returns array of { fromUserId, toUserId, amount } where fromUserId owes toUserId.
 */
export async function computeRoomBalances(roomId: string): Promise<BalanceEntry[]> {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: {
      members: { include: { user: true } },
      expenses: {
        include: {
          paidBy: true,
          participants: { include: { user: true } },
        },
      },
      settlements: {
        include: { fromUser: true, toUser: true },
      },
    },
  });

  if (!room) return [];

  const memberIds = room.members.map((m) => m.userId);
  const nets: Record<string, number> = {};
  memberIds.forEach((id) => (nets[id] = 0));

  for (const expense of room.expenses) {
    if (expense.paidById) nets[expense.paidById] = (nets[expense.paidById] ?? 0) + expense.amount;
    for (const p of expense.participants) {
      nets[p.userId] = (nets[p.userId] ?? 0) - p.amountOwed;
    }
  }

  for (const s of room.settlements) {
    nets[s.fromUserId] = (nets[s.fromUserId] ?? 0) + s.amount;
    nets[s.toUserId] = (nets[s.toUserId] ?? 0) - s.amount;
  }

  const debtors = memberIds.filter((id) => (nets[id] ?? 0) < 0).sort((a, b) => (nets[a] ?? 0) - (nets[b] ?? 0));
  const creditors = memberIds.filter((id) => (nets[id] ?? 0) > 0).sort((a, b) => (nets[b] ?? 0) - (nets[a] ?? 0));

  const result: BalanceEntry[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtorId = debtors[d];
    const creditorId = creditors[c];
    const debt = -(nets[debtorId] ?? 0);
    const credit = nets[creditorId] ?? 0;
    const amount = Math.min(debt, credit);
    if (amount <= 0) break;

    const debtor = room.members.find((m) => m.userId === debtorId)?.user;
    const creditor = room.members.find((m) => m.userId === creditorId)?.user;

    result.push({
      fromUserId: debtorId,
      toUserId: creditorId,
      amount: Math.round(amount * 100) / 100,
      fromUserName: debtor?.name ?? null,
      toUserName: creditor?.name ?? null,
      fromUserEmail: debtor?.email ?? "",
      toUserEmail: creditor?.email ?? "",
    });

    nets[debtorId] = (nets[debtorId] ?? 0) + amount;
    nets[creditorId] = (nets[creditorId] ?? 0) - amount;

    if (Math.abs(nets[debtorId] ?? 0) < 0.01) d++;
    if (Math.abs(nets[creditorId] ?? 0) < 0.01) c++;
  }

  return result;
}

/**
 * Compute net balance for current user in a room (positive = owed to me, negative = I owe).
 */
export function computeUserNetInRoom(
  expenses: { paidById: string; amount: number; participants: { userId: string; amountOwed: number }[] }[],
  settlements: { fromUserId: string; toUserId: string; amount: number }[],
  userId: string
): number {
  let net = 0;
  for (const expense of expenses) {
    if (expense.paidById === userId) net += expense.amount;
    const share = expense.participants.find((p) => p.userId === userId)?.amountOwed ?? 0;
    net -= share;
  }
  for (const s of settlements) {
    if (s.fromUserId === userId) net += s.amount;
    if (s.toUserId === userId) net -= s.amount;
  }
  return Math.round(net * 100) / 100;
}
