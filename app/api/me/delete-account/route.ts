import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { confirmation?: string } | null;
  if ((body?.confirmation || "").trim().toUpperCase() !== "DELETE") {
    return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      subscriptionStatus: true,
      entitlement: true,
      supabaseAuthId: true,
      generations: { select: { resultPath: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (["active", "trialing", "past_due"].includes(user.subscriptionStatus)) {
    return NextResponse.json({ error: "Cancel active subscription first" }, { status: 409 });
  }

  const supabase = getSupabaseServerClient();
  const resultPaths = user.generations
    .map((g) => g.resultPath.replace(/^\/+/, ""))
    .filter(Boolean);

  if (resultPaths.length > 0) {
    const { error: storageError } = await supabase.storage.from("results").remove(resultPaths);
    if (storageError) {
      return NextResponse.json({ error: "Could not delete generated images" }, { status: 500 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.generation.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  if (user.supabaseAuthId) {
    const { error } = await supabase.auth.admin.deleteUser(user.supabaseAuthId);
    if (error) {
      return NextResponse.json({ error: "Account deleted, but auth cleanup failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
