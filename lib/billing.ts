export type BillingPlan = "free" | "monthly" | "yearly" | "lifetime";

export function resolvePlan(params: {
  entitlement?: string | null;
  recurringInterval?: "month" | "year" | null;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: Date | string | null;
}): BillingPlan {
  const ent = (params.entitlement || "").toLowerCase();
  if (ent === "lifetime") return "lifetime";
  if (ent === "sub_active") return params.recurringInterval === "year" ? "yearly" : "monthly";
  return "free";
}

export function formatPlanLabel(plan: BillingPlan) {
  if (plan === "lifetime") return "Lifetime";
  if (plan === "yearly") return "Jaarlijks";
  if (plan === "monthly") return "Maandelijks";
  return "Gratis";
}
