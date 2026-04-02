import { redirect } from "next/navigation";

import { BillingClient } from "@/components/billing/billing-client";
import { formatPlanLabel, resolvePlan } from "@/lib/billing";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export default async function BillingPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      email: true,
      entitlement: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      subscriptionId: true,
      stripeCustomerId: true,
    },
  });

  if (!user?.email) {
    redirect("/login");
  }

  let recurringInterval: "month" | "year" | null = null;
  if (user.subscriptionId) {
    try {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId, {
        expand: ["items.data.price"],
      });
      const interval = subscription.items.data[0]?.price?.recurring?.interval;
      recurringInterval = interval === "year" ? "year" : interval === "month" ? "month" : null;
    } catch {
      recurringInterval = null;
    }
  }

  const plan = resolvePlan({
    entitlement: user.entitlement,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    recurringInterval,
  });

  const canManageBilling = (plan === "monthly" || plan === "yearly") && !!user.stripeCustomerId;

  return (
    <BillingClient
      email={user.email}
      plan={plan}
      planLabel={formatPlanLabel(plan)}
      subscriptionStatus={user.subscriptionStatus}
      canManageBilling={canManageBilling}
    />
  );
}
