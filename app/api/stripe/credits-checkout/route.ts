import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { hasPaidAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const preferredRegion = "iad1";

type Pack = "pack_10" | "pack_50" | "pack_100";

const PACKS: Record<Pack, { credits: number; envKey: string }> = {
  pack_10: { credits: 10, envKey: "STRIPE_PRICE_CREDITS_10" },
  pack_50: { credits: 50, envKey: "STRIPE_PRICE_CREDITS_50" },
  pack_100: { credits: 100, envKey: "STRIPE_PRICE_CREDITS_100" },
};

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { entitlement: true, currentPeriodEnd: true },
    });

    if (!user || !hasPaidAccess({ entitlement: user.entitlement, currentPeriodEnd: user.currentPeriodEnd })) {
      return NextResponse.json(
        { error: "Top-up credits are only available for active members." },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { pack?: Pack };
    const pack = body.pack && PACKS[body.pack] ? body.pack : null;
    if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

    const stripe = getStripe();

    const safeOriginFromRequest = (() => {
      try {
        const o = new URL(req.url).origin;
        return /^https?:\/\//i.test(o) ? o : "";
      } catch {
        return "";
      }
    })();

    const safeOriginFromEnv = (() => {
      const raw = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
      return /^https?:\/\//i.test(raw) ? raw : "";
    })();

    const origin = safeOriginFromRequest || safeOriginFromEnv || "https://colorbestie-app.vercel.app";

    const priceId = (process.env[PACKS[pack].envKey] ?? "").trim();
    if (!priceId) {
      return NextResponse.json({ error: `Missing ${PACKS[pack].envKey}` }, { status: 500 });
    }

    const checkoutPayload = {
      mode: "payment" as const,
      customer_email: currentUser.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/paywall?credits_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall`,
      metadata: {
        kind: "credits_pack",
        userId: currentUser.id,
        credits: String(PACKS[pack].credits),
        pack,
      },
    };

    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const session = await stripe.checkout.sessions.create(checkoutPayload, {
          idempotencyKey: `credits:${currentUser.id}:${pack}:${Date.now()}:${attempt}`,
        });
        return NextResponse.json({ url: session.url });
      } catch (err) {
        lastErr = err;
        const message = err instanceof Error ? err.message : String(err);
        const isConnectionError = message.toLowerCase().includes("connection to stripe");
        if (!isConnectionError || attempt === 3) break;
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }

    const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
    return NextResponse.json({ error: `credits_checkout_failed: ${message}` }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `credits_checkout_failed: ${message}` }, { status: 500 });
  }
}
