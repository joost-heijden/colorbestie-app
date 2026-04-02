import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { resolveCanonicalUserIds } from "@/lib/user-canonical";

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Ctx) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid generation id" }, { status: 400 });
  }

  const canonical = await resolveCanonicalUserIds({
    currentUserId: currentUser.id,
    email: currentUser.email,
  });

  const generation = await prisma.generation.findFirst({
    where: {
      id,
      userId: { in: canonical.userIds },
    },
    select: {
      id: true,
      resultPath: true,
    },
  });

  if (!generation) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const supabase = getSupabaseServerClient();
  const normalizedPath = generation.resultPath.replace(/^\/+/, "");
  const { data, error } = await supabase.storage.from("results").createSignedUrl(normalizedPath, 60 * 10);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not create image URL" }, { status: 500 });
  }

  return NextResponse.json({ id: generation.id, resultUrl: data.signedUrl });
}

export async function DELETE(_request: Request, context: Ctx) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid generation id" }, { status: 400 });
  }

  const canonical = await resolveCanonicalUserIds({
    currentUserId: currentUser.id,
    email: currentUser.email,
  });

  const generation = await prisma.generation.findFirst({
    where: {
      id,
      userId: { in: canonical.userIds },
    },
    select: {
      id: true,
      resultPath: true,
    },
  });

  if (!generation) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const supabase = getSupabaseServerClient();
  const normalizedPath = generation.resultPath.replace(/^\/+/, "");
  const { error: storageError } = await supabase.storage
    .from("results")
    .remove([normalizedPath]);

  if (storageError) {
    return NextResponse.json({ error: "Could not delete image from storage" }, { status: 500 });
  }

  await prisma.generation.delete({
    where: { id: generation.id },
  });

  return NextResponse.json({ ok: true });
}
