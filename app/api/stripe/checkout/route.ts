import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { captureApiError } from "@/lib/monitoring";
import { stripeCheckoutBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = stripeCheckoutBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, email: true, stripeCustomerId: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripe = getStripe();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const normalizePrice = (value: string | undefined) => value?.trim();

    const prices = {
      monthly: normalizePrice(process.env.STRIPE_PRICE_MONTHLY),
      yearly: normalizePrice(process.env.STRIPE_PRICE_YEARLY),
      lifetime: normalizePrice(process.env.STRIPE_PRICE_LIFETIME),
    } as const;

    const plan = parsedBody.data.plan;
    const markerSelections =
      parsedBody.data.markerSelections && parsedBody.data.markerSelections.length > 0
        ? parsedBody.data.markerSelections
        : parsedBody.data.markerSelection
          ? [parsedBody.data.markerSelection]
          : [];
    const firstMarker = markerSelections[0];
    const priceId = prices[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    const origin = new URL(request.url).origin;

    const sessionCheckout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: plan === "lifetime" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paywall`,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan,
        markerCount: String(markerSelections.length),
        markerBrand: firstMarker?.brand ?? "",
        markerSeries: firstMarker?.series ?? "",
        markerSetSize: firstMarker?.setSize ?? "",
        markerSelectionsJson: markerSelections.length ? JSON.stringify(markerSelections).slice(0, 500) : "",
      },
    });

    if (!sessionCheckout.url) {
      return NextResponse.json({ error: "Missing checkout URL" }, { status: 500 });
    }

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[stripe.checkout] create_failed", { userId: currentUser.id, message });

    captureApiError(error, {
      area: "stripe.checkout",
      event: "create_failed",
      meta: { userId: currentUser.id, message },
    });

    return NextResponse.json({ error: "Unable to start checkout", details: message }, { status: 500 });
  }
}
