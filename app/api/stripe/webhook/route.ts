import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { findUserByStripeSubscriptionId, updateUserEntitlementFromSubscription } from "@/lib/db";
import { claimCreditGrant } from "@/lib/credits-wallet";
import { captureApiError, logEvent } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import { getStripe, getStripeWebhookSecret, toSubscriptionStatus } from "@/lib/stripe";

const MONTHLY_PLAN_CREDITS = 30;
const YEARLY_PLAN_CREDITS = 360;
const LIFETIME_PLAN_CREDITS = 700;

async function resolveUserFromCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  if (userId) {
    const byId = await prisma.user.findUnique({ where: { id: userId } });
    if (byId) return byId;
  }

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (customerId) {
    const byCustomer = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
    if (byCustomer) return byCustomer;
  }

  const email = (session.customer_details?.email ?? "").trim();
  if (email) {
    return prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  }

  return null;
}

async function resolveUserFromInvoice(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

  if (subscriptionId) {
    const bySub = await findUserByStripeSubscriptionId(subscriptionId);
    if (bySub) return bySub;
  }

  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (customerId) {
    const byCustomer = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
    if (byCustomer) return byCustomer;
  }

  const email = (invoice.customer_email ?? "").trim();
  if (email) {
    return prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  }

  return null;
}

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

function creditsForInvoiceLine(line: Stripe.InvoiceLineItem) {
  const priceId = typeof line.price === "string" ? line.price : line.price?.id;
  const byPriceId = creditsForSubscriptionPrice(priceId);
  if (byPriceId > 0) return byPriceId;

  const interval = typeof line.price === "string" ? null : line.price?.recurring?.interval;
  if (interval === "month") return MONTHLY_PLAN_CREDITS;
  if (interval === "year") return YEARLY_PLAN_CREDITS;
  return 0;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    captureApiError(error, { area: "stripe.webhook", event: "invalid_signature" });
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    logEvent("info", { area: "stripe.webhook", event: "received", meta: { type: event.type, id: event.id } });

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const user = await resolveUserFromCheckoutSession(session);
        if (!user) {
          logEvent("warn", {
            area: "stripe.webhook",
            event: "checkout_user_not_found",
            meta: { sessionId: session.id, customer: session.customer },
          });
          break;
        }

        if (session.mode === "payment") {
          if (session.metadata?.kind === "credits_pack") {
            const credits = Number(session.metadata?.credits || "0");
            if (Number.isFinite(credits) && credits > 0) {
              const grant = await claimCreditGrant({
                grantId: `checkout_session:${session.id}`,
                userId: user.id,
                credits,
              });
              logEvent("info", {
                area: "stripe.webhook",
                event: "credits_pack_grant",
                meta: { sessionId: session.id, userId: user.id, credits, applied: grant.applied, balance: grant.balance },
              });
            }
            break;
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

          const grant = await claimCreditGrant({
            grantId: `checkout_session:${session.id}`,
            userId: user.id,
            credits: LIFETIME_PLAN_CREDITS,
          });

          logEvent("info", {
            area: "stripe.webhook",
            event: "lifetime_grant",
            meta: { sessionId: session.id, userId: user.id, applied: grant.applied, balance: grant.balance },
          });
        }

        if (session.mode === "subscription") {
          const subscriptionId =
            typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const mappedStatus = toSubscriptionStatus(subscription.status);
            const currentPeriodEnd = subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null;

            await updateUserEntitlementFromSubscription({
              userId: user.id,
              mappedStatus,
              currentPeriodEnd,
              subscriptionId,
            });

            await prisma.user.update({
              where: { id: user.id },
              data: {
                stripeCustomerId:
                  typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? user.stripeCustomerId,
              },
            });
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                entitlement: user.entitlement === "lifetime" ? "lifetime" : "sub_active",
                subscriptionStatus: "active",
                subscriptionId: null,
              },
            });
          }
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

        if (!subscriptionId) break;

        const user = await resolveUserFromInvoice(invoice);
        if (!user) {
          logEvent("warn", {
            area: "stripe.webhook",
            event: "invoice_user_not_found",
            meta: { invoiceId: invoice.id, subscriptionId },
          });
          break;
        }

        const lines = invoice.lines?.data ?? [];
        const creditsToAdd = lines.reduce((sum, line) => {
          const perUnit = creditsForInvoiceLine(line);
          const quantity = line.quantity ?? 1;
          return sum + perUnit * quantity;
        }, 0);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionId,
            stripeCustomerId:
              (typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id) ?? user.stripeCustomerId,
          },
        });

        if (creditsToAdd > 0) {
          const grant = await claimCreditGrant({
            grantId: `invoice:${invoice.id}`,
            userId: user.id,
            credits: creditsToAdd,
          });

          logEvent("info", {
            area: "stripe.webhook",
            event: "invoice_grant",
            meta: {
              invoiceId: invoice.id,
              subscriptionId,
              userId: user.id,
              creditsToAdd,
              applied: grant.applied,
              balance: grant.balance,
            },
          });
        } else {
          logEvent("warn", {
            area: "stripe.webhook",
            event: "invoice_grant_zero",
            meta: {
              invoiceId: invoice.id,
              subscriptionId,
              userId: user.id,
              lineCount: lines.length,
            },
          });
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const user = await findUserByStripeSubscriptionId(subscriptionId);
        if (!user) break;

        const mappedStatus = toSubscriptionStatus(subscription.status);
        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;

        await updateUserEntitlementFromSubscription({
          userId: user.id,
          mappedStatus,
          currentPeriodEnd,
          subscriptionId,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await findUserByStripeSubscriptionId(subscription.id);
        if (!user) break;

        if (user.entitlement === "lifetime") {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              entitlement: "lifetime",
              subscriptionStatus: "canceled",
              subscriptionId: null,
              currentPeriodEnd: null,
            },
          });
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            entitlement: "none",
            subscriptionStatus: "canceled",
            subscriptionId: null,
            currentPeriodEnd: null,
          },
        });

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    captureApiError(error, {
      area: "stripe.webhook",
      event: "handler_failed",
      meta: { type: event.type, id: event.id },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
