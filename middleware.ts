import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type RateRule = {
  key: string;
  methods: string[];
  path: RegExp;
  limit: number;
  windowMs: number;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

type RateLimitHit = {
  ruleKey: string;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
};

const RATE_RULES: RateRule[] = [
  { key: "login", methods: ["POST"], path: /^\/login$/i, limit: 8, windowMs: 10 * 60 * 1000 },
  { key: "auth_callback", methods: ["GET"], path: /^\/auth\/callback$/i, limit: 40, windowMs: 10 * 60 * 1000 },
  { key: "stripe_checkout", methods: ["POST"], path: /^\/api\/stripe\/checkout$/i, limit: 12, windowMs: 10 * 60 * 1000 },
  { key: "upload_url", methods: ["POST"], path: /^\/api\/upload-url$/i, limit: 40, windowMs: 10 * 60 * 1000 },
  { key: "generate", methods: ["POST"], path: /^\/api\/generate$/i, limit: 30, windowMs: 10 * 60 * 1000 },
];

const rateLimitStore =
  (globalThis as typeof globalThis & { __colorbestieRateLimitStore?: Map<string, RateBucket> }).__colorbestieRateLimitStore ??
  new Map<string, RateBucket>();

(globalThis as typeof globalThis & { __colorbestieRateLimitStore?: Map<string, RateBucket> }).__colorbestieRateLimitStore =
  rateLimitStore;

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function maybeCleanupRateLimitStore(now: number) {
  if (rateLimitStore.size < 5000) return;

  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(req: NextRequest): RateLimitHit | null {
  const method = req.method.toUpperCase();
  const path = req.nextUrl.pathname;
  const rule = RATE_RULES.find((candidate) => candidate.methods.includes(method) && candidate.path.test(path));

  if (!rule) return null;

  const now = Date.now();
  maybeCleanupRateLimitStore(now);

  const ip = getClientIp(req);
  const bucketKey = `${rule.key}:${ip}`;
  let bucket = rateLimitStore.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + rule.windowMs };
    rateLimitStore.set(bucketKey, bucket);
  }

  bucket.count += 1;

  const remaining = Math.max(0, rule.limit - bucket.count);
  if (bucket.count <= rule.limit) {
    return null;
  }

  return {
    ruleKey: rule.key,
    limit: rule.limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

function applySecurityHeaders(req: NextRequest, response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "microphone=(), geolocation=(), camera=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; font-src 'self' data: https:; upgrade-insecure-requests"
  );

  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  if (proto === "https") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

function createRateLimitResponse(req: NextRequest, hit: RateLimitHit) {
  const isApi = req.nextUrl.pathname.startsWith("/api/");
  const response = isApi
    ? NextResponse.json(
        {
          error: "Too many requests",
          code: "RATE_LIMITED",
          rule: hit.ruleKey,
          retryAfter: hit.retryAfterSec,
        },
        { status: 429 }
      )
    : new NextResponse("Too many requests. Please try again shortly.", { status: 429 });

  response.headers.set("Retry-After", String(hit.retryAfterSec));
  response.headers.set("X-RateLimit-Limit", String(hit.limit));
  response.headers.set("X-RateLimit-Remaining", String(hit.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(hit.resetAt / 1000)));

  return response;
}

export async function middleware(req: NextRequest) {
  const rateLimitHit = checkRateLimit(req);
  if (rateLimitHit) {
    return applySecurityHeaders(req, createRateLimitResponse(req, rateLimitHit));
  }

  if (req.nextUrl.hostname === "www.colorbestie.app") {
    const canonicalUrl = req.nextUrl.clone();
    canonicalUrl.hostname = "colorbestie.app";
    return applySecurityHeaders(req, NextResponse.redirect(canonicalUrl, 308));
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
      return applySecurityHeaders(req, NextResponse.redirect(new URL("/app", req.url)));
    }
  }

  return applySecurityHeaders(req, NextResponse.next());
}

export const config = {
  matcher: ["/:path*"],
};
