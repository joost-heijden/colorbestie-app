import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type GrantRow = {
  session_id: string;
  credits: number;
  created_at: Date;
};

type CreditEvent = {
  id: string;
  kind: "grant" | "usage";
  amount: number;
  createdAt: string;
  label: string;
};

function labelForGrant(sessionId: string) {
  if (sessionId.startsWith("invoice:")) return "Subscription credits";
  if (sessionId.startsWith("subscription_cycle:")) return "Subscription credits";
  if (sessionId.startsWith("checkout_session:")) return "Checkout credits";
  if (sessionId.startsWith("lifetime_seed:")) return "Lifetime migration credits";
  return "Credit top-up";
}

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [grants, usages] = await Promise.all([
      prisma.$queryRawUnsafe<GrantRow[]>(
        `select session_id, credits, created_at
         from credit_grants
         where user_id = $1
         order by created_at desc
         limit 30`,
        currentUser.id
      ),
      prisma.generation.findMany({
        where: { userId: currentUser.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, createdAt: true },
      }),
    ]);

    const events: CreditEvent[] = [
      ...grants.map((g) => ({
        id: `grant:${g.session_id}`,
        kind: "grant" as const,
        amount: Math.max(0, Number(g.credits || 0)),
        createdAt: new Date(g.created_at).toISOString(),
        label: labelForGrant(g.session_id),
      })),
      ...usages.map((u) => ({
        id: `usage:${u.id}`,
        kind: "usage" as const,
        amount: -1,
        createdAt: u.createdAt.toISOString(),
        label: "Image generation",
      })),
    ]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 20);

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
