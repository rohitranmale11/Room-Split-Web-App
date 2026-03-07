"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/app/actions/expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RoomDetailProps = {
  room: any;
  currentUserId: string;
};

type TabId = "overview" | "members" | "expenses" | "balances";

export function RoomDetail({ room, currentUserId }: RoomDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreateExpense(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await createExpense(formData);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create expense");
    } finally {
      setLoading(false);
    }
  }

  const members = room.members;
  const expenses = room.expenses;

  const currentMemberCount = members.length;

  let currentUserNet = 0;
  for (const expense of expenses) {
    const participantShare = expense.participants.find(
      (p: any) => p.userId === currentUserId
    )?.amountOwed;

    if (expense.paidById === currentUserId) {
      currentUserNet += expense.amount;
    }
    if (participantShare) {
      currentUserNet -= participantShare;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {room.roomName}
          </h1>
          <p className="text-sm text-slate-600">
            {currentMemberCount} member{currentMemberCount === 1 ? "" : "s"} • Invite code{" "}
            <span className="font-mono text-xs">{room.inviteCode}</span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full text-xs">Add expense</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form action={onCreateExpense}>
              <DialogHeader>
                <DialogTitle>Add expense</DialogTitle>
                <DialogDescription className="text-xs">
                  Create a new shared expense for this room. It will be split equally across all
                  members.
                </DialogDescription>
              </DialogHeader>
              <input type="hidden" name="roomId" value={room.id} />
              <div className="mt-4 space-y-4">
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Electricity bill - March"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="120.00"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-2 text-xs">
        {[
          { id: "overview", label: "Overview" },
          { id: "members", label: "Members" },
          { id: "expenses", label: "Expenses" },
          { id: "balances", label: "Balances" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`rounded-full px-3 py-1 font-medium ${
              activeTab === tab.id
                ? "bg-slate-900 text-slate-50"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200/80 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Total expenses</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                All expenses logged in this room.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-950">
                $
                {expenses
                  .reduce((sum: number, e: any) => sum + e.amount, 0)
                  .toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Members</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                People currently sharing this room.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-950">{members.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Your position</CardTitle>
              <CardDescription className="text-xs text-slate-600">
                How much you owe or are owed in this room.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-semibold ${
                  currentUserNet > 0
                    ? "text-emerald-600"
                    : currentUserNet < 0
                    ? "text-rose-600"
                    : "text-slate-950"
                }`}
              >
                {currentUserNet === 0
                  ? "$0.00"
                  : `${currentUserNet > 0 ? "+" : "-"}$${Math.abs(currentUserNet).toFixed(2)}`}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "members" && (
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Members</CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Everyone who can view and contribute to this room.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                No members yet. Share the invite code with your roommates to get started.
              </p>
            ) : (
              members.map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">
                      {m.user.name || m.user.email}
                      {m.userId === currentUserId && (
                        <span className="ml-1 text-[10px] text-slate-500">(you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">{m.user.email}</p>
                  </div>
                  <p className="text-[11px] capitalize text-slate-500">{m.role}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "expenses" && (
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Expenses</CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Line-items for everything logged in this room.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenses.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                No expenses yet. Add your first bill to start tracking.
              </p>
            ) : (
              expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">{expense.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Paid by {expense.paidBy.name || expense.paidBy.email} on{" "}
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-950">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {expense.participants.length} participant
                      {expense.participants.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "balances" && (
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Balances</CardTitle>
            <CardDescription className="text-xs text-slate-600">
              High-level view of who owes who, based on expenses and splits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                Add members and expenses to see per-person balances.
              </p>
            ) : expenses.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                Once you add expenses, RoomSplit will calculate balances for each member here.
              </p>
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">
                Detailed per-member balances are coming soon. For now, use the overview card above
                to see your own position.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

