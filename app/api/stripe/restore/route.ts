import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { claimCreditGrant } from "@/lib/credits-wallet";
import { updateUserEntitlementFromSubscription } from "@/lib/db";
import { captureApiError, logEvent } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import { getStripe, toSubscriptionStatus } from "@/lib/stripe";

const MONTHLY_PLAN_CREDITS = 30;
const YEARLY_PLAN_CREDITS = 360;
const LIFETIME_PLAN_CREDITS = 700;

function cleanEnv(value?: string) {
  if (!value) return "";
  return value.replace(/\\r\\n/g, "").replace(/[\r\n]+$/g, "").trim();
}

function creditsForSubscriptionPrice(priceId: string | null | undefined) {
  const normalized = cleanEnv(priceId ?? "");
  if (!normalized) return 0;

  if (normalized === cleanEnv(process.env.STRIPE_PRICE_MONTHLY)) return MONTHLY_PLAN_CREDITS;
  if (normalized === cleanEnv(process.env.STRIPE_PRICE_YEARLY)) return YEARLY_PLAN_CREDITS;
  return 0;
}

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { id: true, email: true, stripeCustomerId: true, entitlement: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const stripe = getStripe();

    let customerId = user.stripeCustomerId ?? null;

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 10 });
      const exact = customers.data.find((c) => (c.email ?? "").toLowerCase() === user.email!.toLowerCase());
      if (exact) {
        customerId = exact.id;
        await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
      }
    }

    if (!customerId) {
      return NextResponse.json({ restored: false, reason: "no_customer" }, { status: 200 });
    }

    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
    const activeSub = subscriptions.data.find((s) => ["active", "trialing", "past_due"].includes(s.status));

    if (activeSub) {
      const mappedStatus = toSubscriptionStatus(activeSub.status);
      const currentPeriodEnd = activeSub.current_period_end ? new Date(activeSub.current_period_end * 1000) : null;

      await updateUserEntitlementFromSubscription({
        userId: user.id,
        mappedStatus,
        currentPeriodEnd,
        subscriptionId: activeSub.id,
      });

      const invoices = await stripe.invoices.list({ customer: customerId, subscription: activeSub.id, limit: 10 });
      const paidInvoice = invoices.data.find((inv) => inv.status === "paid");

      if (paidInvoice) {
        const lines = paidInvoice.lines?.data ?? [];
        const creditsToAdd = lines.reduce((sum, line) => {
          const priceId = typeof line.price === "string" ? line.price : line.price?.id;
          const perUnit = creditsForSubscriptionPrice(priceId);
          const quantity = line.quantity ?? 1;
          return sum + perUnit * quantity;
        }, 0);

        if (creditsToAdd > 0) {
          const grant = await claimCreditGrant({
            grantId: `invoice:${paidInvoice.id}`,
            userId: user.id,
            credits: creditsToAdd,
          });

          logEvent("info", {
            area: "stripe.restore",
            event: "invoice_grant_recovered",
            meta: { invoiceId: paidInvoice.id, userId: user.id, creditsToAdd, applied: grant.applied, balance: grant.balance },
          });
        }
      }

      return NextResponse.json({ restored: true, type: "subscription" });
    }

    // Handle one-time checkouts (including 100% discount checkouts where no payment is required).
    const checkoutSessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 20 });
    const completedOneTime = checkoutSessions.data.find(
      (s) => s.status === "complete" && s.mode === "payment" && ["paid", "no_payment_required"].includes(s.payment_status)
    );

    if (completedOneTime) {
      if (completedOneTime.metadata?.kind === "credits_pack") {
        const credits = Number(completedOneTime.metadata?.credits || "0");
        if (Number.isFinite(credits) && credits > 0) {
          await claimCreditGrant({
            grantId: `checkout_session:${completedOneTime.id}`,
            userId: user.id,
            credits,
          });
          return NextResponse.json({ restored: true, type: "credits_pack_checkout" });
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          entitlement: "lifetime",
          subscriptionStatus: "inactive",
          subscriptionId: null,
          currentPeriodEnd: null,
        },
      });

      await claimCreditGrant({
        grantId: `checkout_session:${completedOneTime.id}`,
        userId: user.id,
        credits: LIFETIME_PLAN_CREDITS,
      });

      return NextResponse.json({ restored: true, type: "lifetime_checkout" });
    }

    return NextResponse.json({ restored: false, reason: "no_active_purchase" }, { status: 200 });
  } catch (error) {
    captureApiError(error, {
      area: "stripe.restore",
      event: "failed",
      meta: { userId: currentUser.id },
    });
    return NextResponse.json({ error: "Could not restore access" }, { status: 500 });
  }
}
