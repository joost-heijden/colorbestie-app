import { NextResponse } from "next/server";

import { hasPaidAccess } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient, getSupabaseStoragePublicBaseUrl } from "@/lib/supabase-server";
import { uploadUrlBodySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = uploadUrlBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { entitlement: true, currentPeriodEnd: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const entitled = hasPaidAccess({ entitlement: user.entitlement, currentPeriodEnd: user.currentPeriodEnd });
  const FREE_TRIAL_LIMIT = 2;
  const usedGenerations = await prisma.generation.count({ where: { userId: currentUser.id } });

  if (!entitled && usedGenerations >= FREE_TRIAL_LIMIT) {
    return NextResponse.json(
      { error: "Payment Required", code: "TRIAL_LIMIT_REACHED", trialLimit: FREE_TRIAL_LIMIT, used: usedGenerations },
      { status: 402 }
    );
  }

  const contentType = parsedBody.data.contentType;
  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `${currentUser.id}/${crypto.randomUUID()}.${ext}`;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.storage.from("uploads").createSignedUploadUrl(path);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Could not create signed upload URL" }, { status: 500 });
  }

  const baseUrl = getSupabaseStoragePublicBaseUrl();
  const uploadUrl = data.signedUrl.startsWith("http") ? data.signedUrl : `${baseUrl}${data.signedUrl}`;

  return NextResponse.json({ uploadUrl, path });
}
