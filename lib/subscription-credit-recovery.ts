import { claimCreditGrant, getCreditBalance } from "@/lib/credits-wallet";
import { logEvent } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const MONTHLY_PLAN_CREDITS = 30;
const YEARLY_PLAN_CREDITS = 360;

function entitledCreditsForInterval(interval: string | null | undefined) {
  if (interval === "year") return YEARLY_PLAN_CREDITS;
  if (interval === "month") return MONTHLY_PLAN_CREDITS;
  return 0;
}

export async function recoverMissingSubscriptionCredits(params: {
  userId: string;
  email?: string | null;
  subscriptionId?: string | null;
  source: "me" | "generate" | "webhook";
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      entitlement: true,
      subscriptionStatus: true,
      subscriptionId: true,
    },
  });

  if (!user) return { applied: false, reason: "user_not_found" as const, balance: 0 };

  const status = (user.subscriptionStatus || "").toLowerCase();
  const entitlement = (user.entitlement || "").toLowerCase();
  const activeLike = status === "active" || status === "trialing" || status === "past_due";

  if (!activeLike || entitlement === "lifetime") {
    return { applied: false, reason: "not_active_subscription" as const, balance: await getCreditBalance(user.id) };
  }

  const currentBalance = await getCreditBalance(user.id);
  if (currentBalance > 0) {
    return { applied: false, reason: "balance_positive" as const, balance: currentBalance };
  }

  const subscriptionId = params.subscriptionId || user.subscriptionId;
  if (!subscriptionId) {
    return { applied: false, reason: "missing_subscription_id" as const, balance: currentBalance };
  }

  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] });

  const subStatus = (sub.status || "").toLowerCase();
  if (!(subStatus === "active" || subStatus === "trialing" || subStatus === "past_due")) {
    return { applied: false, reason: "stripe_not_active" as const, balance: currentBalance };
  }

  const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
  const entitledCredits = entitledCreditsForInterval(interval);
  if (!entitledCredits) {
    return { applied: false, reason: "unsupported_interval" as const, balance: currentBalance };
  }

  const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000) : null;
  const periodStartIso = periodStart?.toISOString();
  if (!periodStartIso) {
    return { applied: false, reason: "missing_period_start" as const, balance: currentBalance };
  }

  const usageRows = await prisma.$queryRawUnsafe<Array<{ used: number | null }>>(
    `select count(*)::int as used
     from generations
     where user_id::text = $1 and created_at >= $2::timestamptz`,
    user.id,
    periodStartIso
  );

  const usedInPeriod = Number(usageRows[0]?.used ?? 0);
  const creditsToAdd = Math.max(0, entitledCredits - usedInPeriod);
  if (creditsToAdd <= 0) {
    return { applied: false, reason: "no_credits_needed" as const, balance: currentBalance };
  }

  const grantId = `invoice_recovery:${sub.id}:${sub.current_period_start}`;
  const grant = await claimCreditGrant({
    grantId,
    userId: user.id,
    credits: creditsToAdd,
  });

  logEvent("info", {
    area: "credits",
    event: "subscription_recovery",
    meta: {
      source: params.source,
      userId: user.id,
      email: params.email ?? null,
      subscriptionId: sub.id,
      periodStart: periodStartIso,
      interval: interval ?? null,
      entitledCredits,
      usedInPeriod,
      creditsToAdd,
      applied: grant.applied,
      balance: grant.balance,
    },
  });

  return { applied: grant.applied, reason: "recovered" as const, balance: grant.balance };
}
