"use client";

import { useState, useEffect } from "react";
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

const schema = z.object({
  amount: z.string().min(1, "Amount is required").transform(Number).refine((val) => val > 0, "Amount must be greater than 0"),
  type: z.enum(["personal", "room"]),
  roomId: z.string().optional(),
  note: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type FormData = z.infer<typeof schema>;

interface QuickAddExpenseFormProps {
  onClose: () => void;
}

export function QuickAddExpenseForm({ onClose }: QuickAddExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<{ id: string; roomName: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "personal",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const expenseType = watch("type");

  useEffect(() => {
    // Fetch rooms and categories
    const fetchData = async () => {
      try {
        const [roomsRes, categoriesRes] = await Promise.all([
          fetch("/api/user/rooms"),
          fetch("/api/categories?type=expense"),
        ]);

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData.rooms || []);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const endpoint = data.type === "personal" 
        ? "/dashboard/personal-expenses/api/create"
        : "/dashboard/expenses/api/create";

      const formData = new FormData();
      formData.append("amount", data.amount.toString());
      formData.append("note", data.note || "");
      formData.append("categoryId", data.categoryId || "");
      formData.append("date", data.date);
      
      if (data.type === "room" && data.roomId) {
        formData.append("roomId", data.roomId);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add expense");
      }

      onClose();
      // Optionally refresh the page or show a success message
      window.location.reload();
    } catch (error) {
      console.error("Error adding expense:", error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Expense Type</Label>
        <Select onValueChange={(value) => setValue("type", value as "personal" | "room")}>
          <SelectTrigger>
            <SelectValue placeholder="Select expense type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal Expense</SelectItem>
            <SelectItem value="room">Room Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      {expenseType === "room" && (
        <div className="space-y-2">
          <Label htmlFor="roomId">Room</Label>
          <Select onValueChange={(value) => setValue("roomId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.roomName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Adding..." : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}
