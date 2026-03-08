"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSubscription(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const priceRaw = formData.get("price") as string;
  const billingCycle = (formData.get("billingCycle") as string) || "MONTHLY";
  const nextPaymentDateStr = formData.get("nextPaymentDate") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || !priceRaw || !nextPaymentDateStr)
    throw new Error("Name, price, and next payment date are required");

  const price = parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) throw new Error("Please enter a valid price");

  await db.subscription.create({
    data: {
      userId: session.user.id,
      name,
      price,
      billingCycle: billingCycle as "MONTHLY" | "YEARLY",
      nextPaymentDate: new Date(nextPaymentDateStr),
      notes: notes || undefined,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscriptions");
  return { success: true };
}

export async function updateSubscription(subscriptionId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub || sub.userId !== session.user.id) throw new Error("Subscription not found");

  const name = (formData.get("name") as string)?.trim();
  const priceRaw = formData.get("price") as string;
  const billingCycle = (formData.get("billingCycle") as string) || "MONTHLY";
  const nextPaymentDateStr = formData.get("nextPaymentDate") as string;

  if (!name || !priceRaw || !nextPaymentDateStr)
    throw new Error("Name, price, and next payment date are required");

  const price = parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) throw new Error("Invalid price");

  await db.subscription.update({
    where: { id: subscriptionId },
    data: {
      name,
      price,
      billingCycle: billingCycle as "MONTHLY" | "YEARLY",
      nextPaymentDate: new Date(nextPaymentDateStr),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscriptions");
  return { success: true };
}

export async function deleteSubscription(subscriptionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub || sub.userId !== session.user.id) throw new Error("Subscription not found");

  await db.subscription.delete({ where: { id: subscriptionId } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscriptions");
  return { success: true };
}
