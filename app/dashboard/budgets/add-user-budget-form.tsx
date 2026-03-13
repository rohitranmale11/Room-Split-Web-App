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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const schema = z.object({
  amount: z.string().min(1, "Amount is required").transform(Number).refine((val) => val > 0, "Amount must be greater than 0"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
});

type FormData = z.infer<typeof schema>;

interface AddUserBudgetFormProps {
  currentBudget?: {
    id: string;
    amount: number;
    month: number;
    year: number;
  };
}

export function AddUserBudgetForm({ currentBudget }: AddUserBudgetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: currentBudget ? {
      amount: currentBudget.amount.toString(),
      month: currentBudget.month.toString(),
      year: currentBudget.year.toString(),
    } : {
      month: currentMonth.toString(),
      year: currentYear.toString(),
    },
  });

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", data.amount.toString());
      formData.append("month", data.month);
      formData.append("year", data.year);

      const response = await fetch("/dashboard/budgets/api/set", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to set budget");
      }

      router.refresh();
    } catch (error) {
      console.error("Error setting budget:", error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Monthly Budget Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="1000.00"
          {...register("amount")}
          className={cn(errors.amount && "border-red-500")}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Select onValueChange={(value) => setValue("month", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Select onValueChange={(value) => setValue("year", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : currentBudget ? "Update Budget" : "Set Budget"}
      </Button>
    </form>
  );
}
