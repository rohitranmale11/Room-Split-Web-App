"use client";

import { useState } from "react";
import { createBudget } from "@/app/actions/budgets";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = { id: string; name: string };

export function AddBudgetForm({ categories }: { categories: Category[] }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      await createBudget(formData);
      toast.success("Budget set");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set budget");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
          required
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="amount">Monthly limit ($)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
      </div>
      <input type="hidden" name="period" value="MONTHLY" />
      <Button type="submit" disabled={pending}>
        {pending ? "Setting…" : "Set budget"}
      </Button>
    </form>
  );
}
