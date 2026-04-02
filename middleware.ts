import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.hostname === "www.colorbestie.app") {
    const canonicalUrl = req.nextUrl.clone();
    canonicalUrl.hostname = "colorbestie.app";
    return applySecurityHeaders(NextResponse.redirect(canonicalUrl, 308));
  }

  if (req.nextUrl.pathname.startsWith("/onboarding")) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    });

    const hasSupabaseSessionCookie = req.cookies
      .getAll()
      .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

    if (token?.uid || hasSupabaseSessionCookie) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/app", req.url)));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/:path*"],
};
