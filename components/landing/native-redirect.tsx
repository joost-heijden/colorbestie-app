"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNative } from "@/lib/native-bridge";

/**
 * On native iOS: new (not-logged-in) users land on "/" and should be sent
 * directly to /onboarding so they don't get stuck on the marketing page.
 * Logged-in users are already redirected to /app by the homepage server component.
 */
export function NativeRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isNative()) {
      router.replace("/onboarding");
    }
  }, [router]);

  return null;
}
