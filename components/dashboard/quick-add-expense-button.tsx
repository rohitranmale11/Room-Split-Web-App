"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuickAddExpenseForm } from "./quick-add-expense-form";

export function QuickAddExpenseButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:h-16 md:w-16"
        >
          <Plus className="h-6 w-6 md:h-8 md:w-8" />
          <span className="sr-only">Add Expense</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Add Expense</DialogTitle>
          <DialogDescription>
            Add a personal or room expense in seconds.
          </DialogDescription>
        </DialogHeader>
        <QuickAddExpenseForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
