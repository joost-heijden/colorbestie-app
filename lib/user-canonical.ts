import { prisma } from "@/lib/prisma";

export async function resolveCanonicalUserIds(params: { currentUserId: string; email?: string | null }) {
  const email = params.email?.trim().toLowerCase() || null;

  const anchors = await prisma.user.findMany({
    where: {
      OR: [
        { id: params.currentUserId },
        ...(email ? [{ email }] : []),
      ],
    },
    select: { id: true, email: true, supabaseAuthId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const anchorIds = Array.from(new Set(anchors.map((u) => u.id)));
  const anchorEmails = Array.from(new Set(anchors.map((u) => u.email).filter(Boolean)));
  const supabaseIds = Array.from(new Set(anchors.map((u) => u.supabaseAuthId).filter((v): v is string => !!v)));

  const related = await prisma.user.findMany({
    where: {
      OR: [
        ...(anchorIds.length ? [{ id: { in: anchorIds } }] : []),
        ...(anchorEmails.length ? [{ email: { in: anchorEmails } }] : []),
        ...(supabaseIds.length ? [{ supabaseAuthId: { in: supabaseIds } }] : []),
      ],
    },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const canonicalIds = Array.from(new Set(related.map((u) => u.id)));

  if (canonicalIds.length === 0) {
    return {
      primaryUserId: params.currentUserId,
      userIds: [params.currentUserId],
      resolved: false,
    };
  }

  return {
    primaryUserId: canonicalIds[0],
    userIds: canonicalIds,
    resolved: true,
  };
}
