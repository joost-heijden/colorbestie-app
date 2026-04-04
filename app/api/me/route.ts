import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { NextResponse } from "next/server";
import { claimCreditGrant, getCreditBalance } from "@/lib/credits-wallet";
import { recoverMissingSubscriptionCredits } from "@/lib/subscription-credit-recovery";

const FREE_TRIAL_LIMIT = 2;

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ user: null }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      skillLevel: true,
      entitlement: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      subscriptionId: true,
      disclaimerAcceptedAt: true,
    },
  });

  if (!user) return NextResponse.json({ user: null }, { status: 404 });

  let usedGenerations = 0;
  let creditsRemaining = 0;
  let freeTrialUsed = 0;
  let learnCurrentStreak = 0;
  let learnLongestStreak = 0;
  let learnLastVisitDate: string | null = null;

  try {
    const trialRows = await prisma.$queryRaw<Array<{ used: number | null }>>`
      SELECT COALESCE(free_trial_used_count, 0)::int AS used
      FROM users
      WHERE id = ${currentUser.id}::uuid
      LIMIT 1
    `;
    freeTrialUsed = Number(trialRows[0]?.used ?? 0);
    usedGenerations = freeTrialUsed;

    const learnRows = await prisma.$queryRaw<Array<{ current: number | null; longest: number | null; last: Date | null }>>`
      SELECT COALESCE(learn_current_streak, 0)::int AS current,
             COALESCE(learn_longest_streak, 0)::int AS longest,
             learn_last_visit_date AS last
      FROM users
      WHERE id = ${currentUser.id}::uuid
      LIMIT 1
    `;
    learnCurrentStreak = Number(learnRows[0]?.current ?? 0);
    learnLongestStreak = Number(learnRows[0]?.longest ?? 0);
    learnLastVisitDate = learnRows[0]?.last ? new Date(learnRows[0].last).toISOString().slice(0, 10) : null;

    if ((user.entitlement || "").toLowerCase() === "lifetime") {
      await claimCreditGrant({
        grantId: `lifetime_seed:${currentUser.id}`,
        userId: currentUser.id,
        credits: 700,
      });
    }

    await recoverMissingSubscriptionCredits({
      userId: currentUser.id,
      email: user.email,
      subscriptionId: user.subscriptionId,
      source: "me",
    });

    creditsRemaining = await getCreditBalance(currentUser.id);
  } catch {
    usedGenerations = 0;
    creditsRemaining = 0;
    freeTrialUsed = 0;
    learnCurrentStreak = 0;
    learnLongestStreak = 0;
    learnLastVisitDate = null;
  }

  return NextResponse.json({
    user,
    usage: {
      usedGenerations,
      usedInCycle: 0,
      creditsTotal: creditsRemaining,
      subscriptionRemaining: 0,
      purchasedCreditBalance: creditsRemaining,
      creditsRemaining,
      freeTrialLimit: FREE_TRIAL_LIMIT,
      freeTrialUsed,
      freeTrialRemaining: Math.max(0, FREE_TRIAL_LIMIT - freeTrialUsed),
      cycle: "wallet",
    },
    disclaimer: {
      accepted: Boolean(user.disclaimerAcceptedAt),
      acceptedAt: user.disclaimerAcceptedAt,
    },
    learn: {
      currentStreak: learnCurrentStreak,
      longestStreak: learnLongestStreak,
      lastVisitDate: learnLastVisitDate,
    },
  });
}
