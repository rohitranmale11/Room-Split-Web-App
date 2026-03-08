"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/app/actions/expenses";
import { leaveRoom, deleteRoom } from "@/app/actions/rooms";
import { removeMember, updateMemberRole } from "@/app/actions/members";
import { createSettlement } from "@/app/actions/settlements";
import { getRoomBalances } from "@/app/actions/balances";
import { toast } from "sonner";
import {
  ArrowLeft,
  LogOut,
  Trash2,
  MoreVertical,
  UserMinus,
  Shield,
  DollarSign,
  Receipt,
  User,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Category = { id: string; name: string };
type RoomDetailProps = {
  room: {
    id: string;
    roomName: string;
    description: string | null;
    currency: string;
    inviteCode: string;
    members: { id: string; userId: string; role: string; user: { id: string; name: string | null; email: string } }[];
    expenses: {
      id: string;
      title: string;
      amount: number;
      date: Date;
      notes: string | null;
      splitType: string;
      category: { id: string; name: string } | null;
      paidBy: { id: string; name: string | null; email: string };
      participants: { userId: string; amountOwed: number; user: { id: string; name: string | null; email: string } }[];
    }[];
    settlements: { id: string; amount: number; fromUserId: string; toUserId: string; fromUser: { name: string | null }; toUser: { name: string | null } }[];
  };
  categories: Category[];
  currentUserId: string;
};

type TabId = "overview" | "members" | "expenses" | "balances";

export function RoomDetail({ room, categories, currentUserId }: RoomDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [balances, setBalances] = useState<Awaited<ReturnType<typeof getRoomBalances>>>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = room.members.find((m) => m.userId === currentUserId)?.role === "admin";
  const members = room.members;
  const expenses = room.expenses;
  const currency = room.currency || "USD";
  const sym = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  let currentUserNet = 0;
  for (const expense of expenses) {
    const share = expense.participants.find((p) => p.userId === currentUserId)?.amountOwed;
    if (expense.paidBy.id === currentUserId) currentUserNet += expense.amount;
    if (share) currentUserNet -= share;
  }
  for (const s of room.settlements) {
    if (s.fromUserId === currentUserId) currentUserNet += s.amount;
    if (s.toUserId === currentUserId) currentUserNet -= s.amount;
  }
  currentUserNet = Math.round(currentUserNet * 100) / 100;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  async function loadBalances() {
    setLoadingBalances(true);
    try {
      const b = await getRoomBalances(room.id);
      setBalances(b);
    } catch {
      toast.error("Could not load balances");
    } finally {
      setLoadingBalances(false);
    }
  }

  async function onCreateExpense(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await createExpense(formData);
      setAddOpen(false);
      router.refresh();
      toast.success("Expense added");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create expense";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onUpdateExpense(formData: FormData) {
    if (!editId) return;
    setLoading(true);
    setError(null);
    try {
      await updateExpense(editId, formData);
      setEditId(null);
      router.refresh();
      toast.success("Expense updated");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteExpense(id: string) {
    try {
      await deleteExpense(id);
      router.refresh();
      toast.success("Expense deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function onLeaveRoom() {
    if (!confirm("Leave this room? You will lose access to all expenses and balances.")) return;
    try {
      await leaveRoom(room.id);
      toast.success("Left room");
      router.push("/dashboard/rooms");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to leave");
    }
  }

  async function onDeleteRoom() {
    if (!confirm("Permanently delete this room and all its data? This cannot be undone.")) return;
    try {
      await deleteRoom(room.id);
      toast.success("Room deleted");
      router.push("/dashboard/rooms");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function onRemoveMember(userId: string) {
    if (!confirm("Remove this member from the room?")) return;
    try {
      await removeMember(room.id, userId);
      router.refresh();
      toast.success("Member removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function onSettle(toUserId: string, amount: number) {
    try {
      await createSettlement(room.id, toUserId, String(amount));
      router.refresh();
      toast.success("Settlement recorded");
      setBalances([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to settle");
    }
  }

  const expenseBeingEdited = editId ? expenses.find((e) => e.id === editId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/rooms">
            <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Back to rooms">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {room.roomName}
            </h1>
            <p className="text-base text-muted-foreground">
              {members.length} member{members.length === 1 ? "" : "s"} • {sym} • Invite:{" "}
              <span className="font-mono text-sm">{room.inviteCode}</span>
            </p>
            {room.description && (
              <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg text-base">Add Expense</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form action={onCreateExpense}>
                <DialogHeader>
                  <DialogTitle className="text-xl">Add expense</DialogTitle>
                  <DialogDescription className="text-base">
                    Split equally by default. Amount in {currency}.
                  </DialogDescription>
                </DialogHeader>
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="splitType" value="EQUAL" />
                <div className="mt-4 space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base">Title</Label>
                    <Input id="title" name="title" placeholder="Electricity bill - March" className="h-10 text-base" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-base">Amount</Label>
                    <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="120.00" className="h-10 text-base" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-base">Category</Label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-base"
                    >
                      <option value="">None</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-base">Notes (optional)</Label>
                    <Input id="notes" name="notes" placeholder="e.g. March bill" className="h-10 text-base" />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={loading} className="text-base">
                    {loading ? "Saving..." : "Save expense"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onLeaveRoom} className="text-base cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Leave room
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem
                  onClick={onDeleteRoom}
                  className="text-base cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete room
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: "overview" as TabId, label: "Overview", icon: Receipt },
          { id: "members" as TabId, label: "Members", icon: User },
          { id: "expenses" as TabId, label: "Expenses", icon: DollarSign },
          { id: "balances" as TabId, label: "Balances", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "balances" && balances.length === 0) loadBalances();
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-base font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total expenses</CardTitle>
              <CardDescription className="text-base">All expenses in this room</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{sym}{totalExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Members</CardTitle>
              <CardDescription className="text-base">People in this room</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{members.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Your position</CardTitle>
              <CardDescription className="text-base">You owe / are owed</CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-semibold ${
                  currentUserNet > 0 ? "text-emerald-600 dark:text-emerald-400" :
                  currentUserNet < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                }`}
              >
                {currentUserNet === 0
                  ? `${sym}0.00`
                  : `${currentUserNet > 0 ? "+" : "-"}${sym}${Math.abs(currentUserNet).toFixed(2)}`}
              </p>
            </CardContent>
          </Card>
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-medium">Recent expenses</CardTitle>
              <CardDescription className="text-base">Latest 5 expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="py-8 text-center text-base text-muted-foreground">No expenses yet</p>
              ) : (
                <div className="space-y-2">
                  {expenses.slice(0, 5).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{e.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {e.paidBy.name || e.paidBy.email} • {new Date(e.date).toLocaleDateString()}
                          {e.category && ` • ${e.category.name}`}
                        </p>
                      </div>
                      <p className="text-base font-semibold">{sym}{e.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members */}
      {activeTab === "members" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Members</CardTitle>
            <CardDescription className="text-base">People who can view and add expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-base">
                      {(m.user.name || m.user.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-base">
                      {m.user.name || m.user.email}
                      {m.userId === currentUserId && (
                        <span className="ml-1 text-sm text-muted-foreground">(you)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{m.user.email}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize">
                    {m.role}
                  </span>
                </div>
                {isAdmin && m.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onRemoveMember(m.userId)}
                        className="cursor-pointer text-destructive focus:text-destructive text-base"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expenses */}
      {activeTab === "expenses" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Expenses</CardTitle>
            <CardDescription className="text-base">All expenses in this room</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.length === 0 ? (
              <p className="py-12 text-center text-base text-muted-foreground">
                No expenses yet. Add your first expense above.
              </p>
            ) : (
              expenses.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground text-base">{e.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {e.paidBy.name || e.paidBy.email} • {new Date(e.date).toLocaleDateString()}
                      {e.category && ` • ${e.category.name}`}
                    </p>
                    {e.notes && <p className="text-sm text-muted-foreground mt-0.5">{e.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{sym}{e.amount.toFixed(2)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditId(e.id)}
                          className="cursor-pointer text-base"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteExpense(e.id)}
                          className="cursor-pointer text-destructive focus:text-destructive text-base"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit expense dialog */}
      {expenseBeingEdited && (
        <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
          <DialogContent className="sm:max-w-md">
            <form action={onUpdateExpense}>
              <DialogHeader>
                <DialogTitle className="text-xl">Edit expense</DialogTitle>
                <DialogDescription className="text-base">Update title, amount, category, or notes</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-base">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={expenseBeingEdited.title}
                    className="h-10 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount" className="text-base">Amount</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={expenseBeingEdited.amount}
                    className="h-10 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-categoryId" className="text-base">Category</Label>
                  <select
                    id="edit-categoryId"
                    name="categoryId"
                    defaultValue={expenseBeingEdited.category?.id ?? ""}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-base"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes" className="text-base">Notes</Label>
                  <Input
                    id="edit-notes"
                    name="notes"
                    defaultValue={expenseBeingEdited.notes ?? ""}
                    className="h-10 text-base"
                  />
                </div>
              </div>
              <input type="hidden" name="participantsJson" value="[]" />
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={loading} className="text-base">
                  {loading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Balances */}
      {activeTab === "balances" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Who owes whom</CardTitle>
            <CardDescription className="text-base">
              Balances based on expenses and settlements. Record a payment when someone pays you back.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingBalances ? (
              <p className="py-8 text-center text-base text-muted-foreground">Loading balances...</p>
            ) : balances.length === 0 && !loadingBalances ? (
              <div className="space-y-3">
                <p className="text-base text-muted-foreground">
                  {expenses.length === 0
                    ? "Add expenses first to see who owes whom."
                    : "Everyone is settled up, or click below to recalculate."}
                </p>
                {expenses.length > 0 && (
                  <Button variant="outline" onClick={loadBalances} className="text-base">
                    Calculate balances
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {balances.map((b) => (
                  <div
                    key={`${b.fromUserId}-${b.toUserId}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                  >
                    <p className="text-base text-foreground">
                      <span className="font-medium">{b.fromUserName || b.fromUserEmail}</span>
                      {" owes "}
                      <span className="font-medium">{b.toUserName || b.toUserEmail}</span>
                      {" "}
                      <span className="font-semibold">{sym}{b.amount.toFixed(2)}</span>
                    </p>
                    {b.toUserId === currentUserId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-base"
                        onClick={() => onSettle(b.fromUserId, b.amount)}
                      >
                        I received {sym}{b.amount.toFixed(2)}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
