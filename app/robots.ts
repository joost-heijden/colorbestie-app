import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://colorbestie.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tools/", "/privacy"],
        disallow: ["/app/", "/api/", "/onboarding/", "/billing/", "/paywall/", "/login/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
