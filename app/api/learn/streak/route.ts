import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function todayUtcDate() {
  return new Date(new Date().toISOString().slice(0, 10));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    localCurrentStreak?: number;
    localLastVisitDate?: string;
  };

  const rows = await prisma.$queryRaw<Array<{
    learn_current_streak: number | null;
    learn_longest_streak: number | null;
    learn_last_visit_date: Date | null;
  }>>`
    SELECT learn_current_streak, learn_longest_streak, learn_last_visit_date
    FROM users
    WHERE id = ${currentUser.id}::uuid
    LIMIT 1
  `;

  const current = rows[0] ?? {
    learn_current_streak: 0,
    learn_longest_streak: 0,
    learn_last_visit_date: null,
  };

  const today = todayUtcDate();
  const yesterday = addDays(today, -1);
  const lastVisit = current.learn_last_visit_date ? new Date(current.learn_last_visit_date) : null;

  let nextCurrent = Number(current.learn_current_streak ?? 0);
  let nextLongest = Number(current.learn_longest_streak ?? 0);
  let nextLastVisit = lastVisit;

  if (!lastVisit) {
    nextCurrent = 1;
    nextLastVisit = today;
  } else {
    const lastIso = lastVisit.toISOString().slice(0, 10);
    const todayIso = today.toISOString().slice(0, 10);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);

    if (lastIso === todayIso) {
      // keep as-is
    } else if (lastIso === yesterdayIso) {
      nextCurrent += 1;
      nextLastVisit = today;
    } else {
      nextCurrent = 1;
      nextLastVisit = today;
    }
  }

  const localCurrent = Math.max(0, Math.floor(Number(body.localCurrentStreak ?? 0) || 0));
  const localLast = typeof body.localLastVisitDate === "string" ? body.localLastVisitDate : "";
  const todayIso = today.toISOString().slice(0, 10);

  if (localCurrent > nextCurrent && localLast === todayIso) {
    nextCurrent = localCurrent;
    nextLastVisit = today;
  }

  nextLongest = Math.max(nextLongest, nextCurrent);

  await prisma.$executeRaw`
    UPDATE users
    SET learn_current_streak = ${nextCurrent},
        learn_longest_streak = ${nextLongest},
        learn_last_visit_date = ${nextLastVisit}
    WHERE id = ${currentUser.id}::uuid
  `;

  return NextResponse.json({
    currentStreak: nextCurrent,
    longestStreak: nextLongest,
    lastVisitDate: nextLastVisit?.toISOString().slice(0, 10) ?? null,
  });
}
