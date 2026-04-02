import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED = ["beginner", "learning", "experienced", "pro"] as const;

type Skill = (typeof ALLOWED)[number];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, skillLevel: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, user: user ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; skillLevel?: string };
    const email = (body.email || "").trim().toLowerCase();
    const skill = (body.skillLevel || "").trim().toLowerCase() as Skill;

    if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
    if (!ALLOWED.includes(skill)) {
      return NextResponse.json({ ok: false, error: "invalid skill" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: "user not found" }, { status: 404 });

    await prisma.user.update({ where: { id: user.id }, data: { skillLevel: skill } });

    const fresh = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, skillLevel: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, user: fresh });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "server error" }, { status: 500 });
  }
}
