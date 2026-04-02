import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getStripe } from "@/lib/stripe";
import { claimCreditGrantForSession } from "@/lib/credits-wallet";

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
  const sessionId = (body.sessionId || "").trim();
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session || session.payment_status !== "paid") {
    return NextResponse.json({ error: "Session not paid" }, { status: 400 });
  }

  const metadata = session.metadata || {};
  if (metadata.kind !== "credits_pack") {
    return NextResponse.json({ error: "Not a credits session" }, { status: 400 });
  }

  if (metadata.userId !== currentUser.id) {
    return NextResponse.json({ error: "Session does not belong to user" }, { status: 403 });
  }

  const credits = Number(metadata.credits || "0");
  if (!Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json({ error: "Invalid credits metadata" }, { status: 400 });
  }

  const result = await claimCreditGrantForSession({ sessionId, userId: currentUser.id, credits });

  return NextResponse.json({
    ok: true,
    applied: result.applied,
    creditsAdded: result.applied ? credits : 0,
    creditBalance: result.balance,
  });
}
