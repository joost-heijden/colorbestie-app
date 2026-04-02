import { auth } from "@/auth";
import { logEvent } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerAuthClient } from "@/lib/supabase-auth-server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  source: "supabase" | "nextauth";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabasePreferred = (process.env.AUTH_SUPABASE_PREFERRED ?? "true").toLowerCase() !== "false";

  // Fast path with validation: NextAuth session id may be app user id OR provider id.
  // Resolve to canonical app user id before returning.
  const session = await auth();
  if (session?.user?.id && session.user.email) {
    try {
      const byId = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, image: true, supabaseAuthId: true },
      });

      if (byId) {
        return {
          id: byId.id,
          email: byId.email,
          name: byId.name,
          image: byId.image,
          source: "nextauth",
        };
      }

      const byAuthOrEmail = await prisma.user.findFirst({
        where: {
          OR: [
            { supabaseAuthId: session.user.id },
            { email: session.user.email },
          ],
        },
        select: { id: true, email: true, name: true, image: true, supabaseAuthId: true },
      });

      if (byAuthOrEmail) {
        if (!byAuthOrEmail.supabaseAuthId) {
          await prisma.$executeRaw`
            UPDATE users
            SET supabase_auth_id = ${session.user.id}
            WHERE id = ${byAuthOrEmail.id}::uuid AND supabase_auth_id IS NULL
          `;
        }

        return {
          id: byAuthOrEmail.id,
          email: byAuthOrEmail.email,
          name: byAuthOrEmail.name,
          image: byAuthOrEmail.image,
          source: "nextauth",
        };
      }
    } catch {
      // Continue to Supabase-preferred path below.
    }
  }

  // Preferred path: Supabase session (Phase 3)
  // Also run this path when there is no NextAuth user session (email/password users).
  if (supabasePreferred || !session?.user?.id) try {
    const supabase = await getSupabaseServerAuthClient();
    const { data } = await supabase.auth.getUser();
    const sUser = data.user;

    if (sUser?.email) {
      const existingRows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM users
        WHERE supabase_auth_id = ${sUser.id}
           OR email = ${sUser.email}
        ORDER BY
          CASE WHEN supabase_auth_id = ${sUser.id} THEN 0 ELSE 1 END,
          updated_at DESC
        LIMIT 1
      `;

      const existingId = existingRows[0]?.id;

      if (!existingId) {
        // New user: must create
        const dbUser = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            email: sUser.email,
            name: (sUser.user_metadata?.full_name ?? sUser.user_metadata?.name ?? null) as string | null,
            image: (sUser.user_metadata?.avatar_url ?? null) as string | null,
          },
          select: { id: true, email: true, name: true, image: true },
        });

        await prisma.$executeRaw`
          UPDATE users
          SET supabase_auth_id = ${sUser.id}
          WHERE id = ${dbUser.id}::uuid AND supabase_auth_id IS NULL
        `;

        if (process.env.AUTH_DEBUG_LOGS === "1") {
          logEvent("info", { area: "auth", event: "current_user.supabase_created", meta: { userId: dbUser.id } });
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
          source: "supabase" as const,
        };
      }

      // Existing user: read without unnecessary writes
      const dbUser = await prisma.user.findUnique({
        where: { id: existingId },
        select: { id: true, email: true, name: true, image: true, supabaseAuthId: true },
      });

      if (!dbUser) return null;

      // Only link supabase_auth_id if not yet set
      if (!dbUser.supabaseAuthId) {
        await prisma.$executeRaw`
          UPDATE users
          SET supabase_auth_id = ${sUser.id}
          WHERE id = ${dbUser.id}::uuid AND supabase_auth_id IS NULL
        `;
      }

      if (process.env.AUTH_DEBUG_LOGS === "1") {
        logEvent("info", { area: "auth", event: "current_user.supabase", meta: { userId: dbUser.id } });
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        source: "supabase" as const,
      };
    }
  } catch (error) {
    if (process.env.AUTH_DEBUG_LOGS === "1") {
      logEvent("warn", { area: "auth", event: "current_user.supabase_failed", meta: { message: error instanceof Error ? error.message : String(error) } });
    }
    // continue to nextauth fallback
  }

  // Last fallback: NextAuth session by email -> db user lookup
  if (!session?.user?.email) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, image: true },
    });

    if (!dbUser) return null;

    if (process.env.AUTH_DEBUG_LOGS === "1") {
      logEvent("warn", { area: "auth", event: "current_user.nextauth_email_fallback", meta: { userId: dbUser.id } });
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      image: dbUser.image,
      source: "nextauth",
    };
  } catch {
    return null;
  }
}
