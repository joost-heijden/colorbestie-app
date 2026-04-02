import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// POST /api/revenuecat/sync
//
// Called by the client after a RevenueCat purchase completes.
// The client sends the customerInfo so we can immediately update
// the user's entitlement without waiting for the webhook.
// ---------------------------------------------------------------------------

const RC_API_KEY = process.env.REVENUECAT_API_SECRET || "";
const RC_ENTITLEMENT_ID = "Colorbestie Pro";

type SyncBody = {
  rcUserId: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: SyncBody;
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.rcUserId) {
    return NextResponse.json({ error: "Missing rcUserId" }, { status: 400 });
  }

  // Verify with RevenueCat's REST API that this user actually has the entitlement
  try {
    const rcResponse = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(body.rcUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${RC_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!rcResponse.ok) {
      return NextResponse.json({ error: "RevenueCat lookup failed" }, { status: 502 });
    }

    const rcData = (await rcResponse.json()) as {
      subscriber?: {
        entitlements?: Record<
          string,
          { expires_date?: string | null; product_identifier?: string }
        >;
        subscriptions?: Record<string, { expires_date?: string | null }>;
      };
    };

    const entitlement = rcData.subscriber?.entitlements?.[RC_ENTITLEMENT_ID];
    if (!entitlement) {
      return NextResponse.json({ ok: false, reason: "no_entitlement" });
    }

    // Determine if lifetime or subscription
    const productId = entitlement.product_identifier || "";
    const isLifetime = productId.includes("lifetime");
    const expiresDate = entitlement.expires_date
      ? new Date(entitlement.expires_date)
      : null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        entitlement: isLifetime ? "lifetime" : "sub_active",
        subscriptionStatus: "active",
        currentPeriodEnd: expiresDate,
        subscriptionId: `rc_${body.rcUserId}`,
      },
    });

    return NextResponse.json({ ok: true, entitlement: isLifetime ? "lifetime" : "sub_active" });
  } catch (error) {
    console.error("[revenuecat-sync] Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
