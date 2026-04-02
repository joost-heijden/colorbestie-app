import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { claimCreditGrant } from "@/lib/credits-wallet";

// ---------------------------------------------------------------------------
// RevenueCat Server-to-Server Webhook
//
// RevenueCat sends events here whenever a purchase, renewal, cancellation
// or other subscription lifecycle event occurs.
//
// Setup in RevenueCat Dashboard → Project → Integrations → Webhooks
// URL: https://colorbestie.app/api/revenuecat/webhook
// Authorization Header: Bearer <REVENUECAT_WEBHOOK_SECRET>
// ---------------------------------------------------------------------------

const WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || "";

// Credit grants per product
const CREDITS_BY_PRODUCT: Record<string, number> = {
  // Match these to your RevenueCat product identifiers
  colorbestie_monthly: 30,
  colorbestie_yearly: 360,
  colorbestie_lifetime: 700,
  // Add credit pack product IDs as needed
  colorbestie_credits_10: 10,
  colorbestie_credits_50: 50,
  colorbestie_credits_100: 100,
};

type RCEvent = {
  type: string;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  entitlement_ids?: string[];
  store: string;
  environment: string;
  id: string;
  event_timestamp_ms: number;
  expiration_at_ms?: number;
  period_type?: string; // "NORMAL" | "TRIAL" | "INTRO"
};

type RCWebhookPayload = {
  api_version: string;
  event: RCEvent;
};

export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  if (WEBHOOK_SECRET) {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: RCWebhookPayload;
  try {
    payload = (await request.json()) as RCWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event;
  if (!event?.type || !event.app_user_id) {
    return NextResponse.json({ error: "Missing event data" }, { status: 400 });
  }

  // app_user_id should be the user's UUID from our system
  const userId = event.app_user_id;

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
  if (!user) {
    // Try original_app_user_id as fallback
    const fallbackUser = await prisma.user
      .findUnique({ where: { id: event.original_app_user_id } })
      .catch(() => null);
    if (!fallbackUser) {
      console.warn(`[revenuecat-webhook] User not found: ${userId}`);
      // Return 200 to prevent retries for unknown users
      return NextResponse.json({ ok: true, skipped: true });
    }
  }

  const resolvedUserId = user?.id || event.original_app_user_id;

  try {
    switch (event.type) {
      // --- Purchase / renewal events that should grant credits ---
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "NON_RENEWING_PURCHASE": {
        const credits = resolveCredits(event.product_id);
        if (credits > 0) {
          await claimCreditGrant({
            grantId: `rc_${event.id}`,
            userId: resolvedUserId,
            credits,
          });
        }

        // Update entitlement in our database
        const isLifetime = event.product_id.includes("lifetime");
        const expirationDate = event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null;

        await prisma.user.update({
          where: { id: resolvedUserId },
          data: {
            entitlement: isLifetime ? "lifetime" : "sub_active",
            subscriptionStatus: "active",
            currentPeriodEnd: expirationDate,
            subscriptionId: `rc_${event.original_app_user_id}`,
          },
        });
        break;
      }

      // --- Cancellation ---
      case "CANCELLATION":
      case "EXPIRATION": {
        const isLifetime =
          (await prisma.user.findUnique({ where: { id: resolvedUserId } }))
            ?.entitlement === "lifetime";

        if (!isLifetime) {
          await prisma.user.update({
            where: { id: resolvedUserId },
            data: {
              entitlement: "none",
              subscriptionStatus: "canceled",
            },
          });
        }
        break;
      }

      // --- Billing issues ---
      case "BILLING_ISSUE": {
        await prisma.user.update({
          where: { id: resolvedUserId },
          data: { subscriptionStatus: "past_due" },
        });
        break;
      }

      // --- Subscription extended (promo, support) ---
      case "SUBSCRIPTION_EXTENDED": {
        const expirationDate = event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null;
        await prisma.user.update({
          where: { id: resolvedUserId },
          data: {
            entitlement: "sub_active",
            subscriptionStatus: "active",
            currentPeriodEnd: expirationDate,
          },
        });
        break;
      }

      // --- Restore / transfer ---
      case "TRANSFER": {
        // Transfer event: user moved from one app_user_id to another
        // The new user should get the entitlement
        const credits = resolveCredits(event.product_id);
        if (credits > 0) {
          await claimCreditGrant({
            grantId: `rc_transfer_${event.id}`,
            userId: resolvedUserId,
            credits,
          });
        }
        break;
      }

      default:
        // PRODUCT_CHANGE, SUBSCRIBER_ALIAS, etc. — acknowledge but no action
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[revenuecat-webhook] Error processing event:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function resolveCredits(productId: string): number {
  // Exact match first
  if (CREDITS_BY_PRODUCT[productId]) return CREDITS_BY_PRODUCT[productId];

  // Partial match (e.g. "com.colorbestie.app.colorbestie_monthly")
  for (const [key, credits] of Object.entries(CREDITS_BY_PRODUCT)) {
    if (productId.includes(key)) return credits;
  }

  // Fallback: try to infer from product ID
  if (productId.includes("monthly")) return 30;
  if (productId.includes("yearly") || productId.includes("annual")) return 360;
  if (productId.includes("lifetime")) return 700;

  return 0;
}
