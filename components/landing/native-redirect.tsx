"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNative } from "@/lib/native-bridge";

/**
 * Previously redirected native users away from the landing page.
 * Now we let native users see the same landing hero with
 * "Get Started Free" and "Account login" options.
 * Logged-in users are already redirected to /app by the homepage server component.
 */
export function NativeRedirect() {
  // No redirect — native users see the landing hero like everyone else
  return null;
}
