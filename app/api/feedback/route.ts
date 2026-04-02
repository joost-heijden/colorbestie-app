import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type FeedbackBody = {
  kind?: "tip" | "feature";
  message?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  const body = (await request.json().catch(() => null)) as FeedbackBody | null;

  const kind = body?.kind;
  const message = body?.message?.trim();

  if (!kind || !["tip", "feature"].includes(kind) || !message || message.length < 5) {
    return NextResponse.json({ error: "Invalid feedback payload" }, { status: 400 });
  }

  const email = session?.user?.email ?? null;
  const userId = session?.user?.id ?? null;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NULL,
      email TEXT NULL,
      kind TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await prisma.$executeRaw`
    INSERT INTO feedback_submissions (user_id, email, kind, message)
    VALUES (${userId}::uuid, ${email}, ${kind}, ${message})
  `;

  return NextResponse.json({ ok: true });
}
