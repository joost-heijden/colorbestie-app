import https from "node:https";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (stripeClient) return stripeClient;

  const secretKey = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const stripeAgent = new https.Agent({
    keepAlive: true,
    family: 4,
  });

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
    maxNetworkRetries: 3,
    timeout: 20_000,
    httpAgent: stripeAgent,
  });

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export function toSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === "active" || status === "trialing") return "active" as const;
  if (status === "past_due" || status === "unpaid") return "past_due" as const;
  if (status === "canceled" || status === "incomplete_expired") return "canceled" as const;
  return "inactive" as const;
}
