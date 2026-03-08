"use client";

import { useState } from "react";
import { createRoom } from "@/app/actions/rooms";
import { toast } from "sonner";
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

const CURRENCIES = ["USD", "INR", "EUR", "GBP"];

export function CreateRoomForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      await createRoom(formData);
      setOpen(false);
      toast.success("Room created successfully");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "An error occurred";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-lg text-base">Create Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Create Room</DialogTitle>
            <DialogDescription className="text-base">
              Create a new room to start splitting expenses with your flatmates.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="roomName" className="text-base">Room name</Label>
              <Input
                id="roomName"
                name="roomName"
                placeholder="e.g. Pune Flat"
                className="h-10 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Brief description of the room"
                className="h-10 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-base">Currency</Label>
              <select
                id="currency"
                name="currency"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-base"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="text-base">
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
