import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

type TokenShape = {
  sub?: string;
  email?: string;
};

export async function requireAuth(request: NextRequest): Promise<{ userId: string; email?: string }> {
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenShape | null;

  if (!token?.sub) {
    throw new Error("UNAUTHORIZED");
  }

  return { userId: token.sub, email: token.email };
}
