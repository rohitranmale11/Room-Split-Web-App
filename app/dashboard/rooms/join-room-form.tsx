"use client";

import { useState } from "react";
import { joinRoom } from "@/app/actions/rooms";
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

export function JoinRoomForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      await joinRoom(formData);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Join Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Join Room</DialogTitle>
            <DialogDescription>
              Enter the invite code shared by your flatmate to join the room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm font-medium text-red-500">{error}</div>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inviteCode" className="text-right">
                Invite Code
              </Label>
              <Input id="inviteCode" name="inviteCode" placeholder="Paste code here" className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
