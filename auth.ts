import NextAuth from "next-auth";
import Apple from "next-auth/providers/apple";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

const AUTH_SECRET = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "").trim();
const AUTH_DEBUG = (process.env.AUTH_DEBUG_LOGS ?? "false").trim() === "true";

if (AUTH_DEBUG) {
  console.log("[auth:init]", {
    hasAuthSecret: Boolean((process.env.AUTH_SECRET ?? "").trim()),
    hasNextAuthSecret: Boolean((process.env.NEXTAUTH_SECRET ?? "").trim()),
    nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    hasGoogleClientId: Boolean((process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "").trim()),
    hasGoogleClientSecret: Boolean((process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "").trim()),
    hasAppleClientId: Boolean((process.env.AUTH_APPLE_ID ?? process.env.APPLE_CLIENT_ID ?? "").trim()),
    hasAppleClientSecret: Boolean((process.env.AUTH_APPLE_SECRET ?? process.env.APPLE_CLIENT_SECRET ?? "").trim()),
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: AUTH_SECRET || undefined,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },  // 1 year
  providers: [
    Google({
      clientId: (process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "").trim(),
      clientSecret: (process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "").trim(),
    }),
    ...((process.env.AUTH_APPLE_ID ?? process.env.APPLE_CLIENT_ID ?? "").trim() && (process.env.AUTH_APPLE_SECRET ?? process.env.APPLE_CLIENT_SECRET ?? "").trim()
      ? [
          Apple({
            clientId: (process.env.AUTH_APPLE_ID ?? process.env.APPLE_CLIENT_ID ?? "").trim(),
            clientSecret: (process.env.AUTH_APPLE_SECRET ?? process.env.APPLE_CLIENT_SECRET ?? "").trim(),
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (AUTH_DEBUG) console.log("[auth:signIn:start]", { email: user.email ?? null });
        if (!user.email) return false;

        const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        },
        create: {
          id: crypto.randomUUID(),
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        },
        select: { id: true },
      });

        user.id = dbUser.id;
        if (AUTH_DEBUG) console.log("[auth:signIn:success]", { email: user.email, userId: dbUser.id });
        return true;
      } catch (error) {
        console.error("[auth:signIn:error]", error);
        throw error;
      }
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } });

        if (dbUser) {
          token.uid = dbUser.id;

          try {
            const rows = await prisma.$queryRaw<Array<{ value: boolean | null }>>`
              SELECT onboarding_complete AS value FROM users WHERE id = ${dbUser.id}::uuid LIMIT 1
            `;
            token.onboardingComplete = Boolean(rows[0]?.value);
          } catch {
            const rows = await prisma.$queryRaw<Array<{ value: boolean | null }>>`
              SELECT onboarding_completed AS value FROM users WHERE id = ${dbUser.id}::uuid LIMIT 1
            `;
            token.onboardingComplete = Boolean(rows[0]?.value);
          }
        }
      }

      if (token.uid && (trigger === "update" || typeof token.onboardingComplete !== "boolean")) {
        try {
          const rows = await prisma.$queryRaw<Array<{ value: boolean | null }>>`
            SELECT onboarding_complete AS value FROM users WHERE id = ${token.uid as string}::uuid LIMIT 1
          `;
          token.onboardingComplete = Boolean(rows[0]?.value);
        } catch {
          const rows = await prisma.$queryRaw<Array<{ value: boolean | null }>>`
            SELECT onboarding_completed AS value FROM users WHERE id = ${token.uid as string}::uuid LIMIT 1
          `;
          token.onboardingComplete = Boolean(rows[0]?.value);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string | undefined) ?? "";
        session.user.email = session.user.email ?? "";
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
