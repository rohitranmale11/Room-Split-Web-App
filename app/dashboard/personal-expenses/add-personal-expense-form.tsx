"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const schema = z.object({
  amount: z.string().min(1, "Amount is required").transform(Number).refine((val) => val > 0, "Amount must be greater than 0"),
  note: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type FormData = z.infer<typeof schema>;

interface AddPersonalExpenseFormProps {
  categories: { id: string; name: string }[];
}

export function AddPersonalExpenseForm({ categories }: AddPersonalExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", data.amount.toString());
      formData.append("note", data.note || "");
      formData.append("categoryId", data.categoryId || "");
      formData.append("date", data.date);

      const response = await fetch("/dashboard/personal-expenses/api/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add expense");
      }

      router.refresh();
    } catch (error) {
      console.error("Error adding expense:", error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
            className={cn(errors.amount && "border-red-500")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            className={cn(errors.date && "border-red-500")}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category (optional)</Label>
        <Select onValueChange={(value) => setValue("categoryId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="e.g., Lunch at restaurant"
          {...register("note")}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
