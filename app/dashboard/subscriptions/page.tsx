import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddSubscriptionForm } from "./add-subscription-form";
import Link from "next/link";

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const subscriptions = await db.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { nextPaymentDate: "asc" },
  });

  const totalMonthly = subscriptions.reduce((s, sub) => {
    if (sub.billingCycle === "YEARLY") return s + sub.price / 12;
    return s + sub.price;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Subscriptions
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Track recurring payments: Netflix, Spotify, Amazon Prime, and more.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Monthly equivalent</CardTitle>
          <CardDescription className="text-base">
            Total recurring spend (monthly equivalent)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">${totalMonthly.toFixed(2)}/mo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Add subscription</CardTitle>
          <CardDescription className="text-base">
            Name, price, billing cycle, and next payment date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddSubscriptionForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Your subscriptions</CardTitle>
          <CardDescription className="text-base">Upcoming payments</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium text-foreground">No subscriptions yet</h3>
              <p className="mt-2 max-w-sm text-base text-muted-foreground">
                Add subscriptions above to track recurring payments.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground text-base">{sub.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${sub.price.toFixed(2)}/{sub.billingCycle === "YEARLY" ? "yr" : "mo"} • Next:{" "}
                      {new Date(sub.nextPaymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-base">${sub.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
