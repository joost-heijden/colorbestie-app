import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { logEvent } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { resolveCanonicalUserIds } from "@/lib/user-canonical";

type GenerationRow = {
  id: string;
  theme: string;
  createdAt: Date;
  resultPath: string;
};

type GenerationThumb = {
  id: string;
  theme: string;
  createdAt: string;
  resultPath: string;
  resultUrl: null;
  thumbUrl: string | null;
};

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Math.min(Number(limitParam), 50) : undefined;

  try {
    const canonical = await resolveCanonicalUserIds({
      currentUserId: currentUser.id,
      email: currentUser.email,
    });

    const generations = await prisma.generation.findMany({
      where: { userId: { in: canonical.userIds } },
      select: { id: true, theme: true, createdAt: true, resultPath: true },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit } : {}),
    }) as GenerationRow[];

    const supabase = getSupabaseServerClient();

    const mapped = await Promise.all(generations.map(async (gen): Promise<GenerationThumb> => {
      const normalizedPath = gen.resultPath.replace(/^\/+/, "");
      const thumbPath = normalizedPath.replace(/([^/]+)$/, "thumb-$1.jpg");

      let thumbUrl: string | null = null;
      const thumbSigned = await supabase.storage.from("results").createSignedUrl(thumbPath, 60 * 60);
      if (!thumbSigned.error && thumbSigned.data?.signedUrl) {
        thumbUrl = thumbSigned.data.signedUrl;
      } else {
        const fallback = await supabase.storage.from("results").createSignedUrl(normalizedPath, 60 * 60, {
          transform: {
            width: 320,
            height: 320,
            resize: "cover",
            quality: 60,
          },
        });
        thumbUrl = fallback.data?.signedUrl ?? null;
      }

      return {
        id: gen.id,
        theme: gen.theme,
        createdAt: gen.createdAt.toISOString(),
        resultPath: gen.resultPath,
        resultUrl: null,
        thumbUrl,
      };
    }));

    return NextResponse.json(
      { generations: mapped },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    logEvent("error", {
      area: "gallery",
      event: "generations_fetch_failed",
      meta: {
        userId: currentUser.id,
        message: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { generations: [], error: "gallery_load_failed" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
