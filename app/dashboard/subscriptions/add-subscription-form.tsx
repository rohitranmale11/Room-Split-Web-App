"use client";

import { useState } from "react";
import { createSubscription } from "@/app/actions/subscriptions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddSubscriptionForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      await createSubscription(formData);
      toast.success("Subscription added");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add subscription");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="e.g. Netflix" required />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
      </div>
      <div>
        <Label htmlFor="billingCycle">Billing cycle</Label>
        <select
          id="billingCycle"
          name="billingCycle"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
        >
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>
      <div>
        <Label htmlFor="nextPaymentDate">Next payment date</Label>
        <Input
          id="nextPaymentDate"
          name="nextPaymentDate"
          type="date"
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Optional" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add subscription"}
      </Button>
    </form>
  );
}
