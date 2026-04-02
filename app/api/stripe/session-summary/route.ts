import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer linked" }, { status: 400 });
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  if (!checkout || checkout.customer !== user.stripeCustomerId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    number: checkout.client_reference_id || checkout.id,
    total: (checkout.amount_total ?? 0) / 100,
    currency: checkout.currency ?? "eur",
  });
}
