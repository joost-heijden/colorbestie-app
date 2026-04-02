import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found for user" }, { status: 400 });
    }

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

    const fallbackOrigin = safeOriginFromRequest || safeOriginFromEnv || "https://colorbestie-app.vercel.app";
    const returnUrlRaw = (process.env.STRIPE_CUSTOMER_PORTAL_RETURN_URL || "").trim();
    const returnUrl = /^https?:\/\//i.test(returnUrlRaw) ? returnUrlRaw : `${fallbackOrigin}/app/profile`;

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `portal_checkout_failed: ${message}` }, { status: 500 });
  }
}
