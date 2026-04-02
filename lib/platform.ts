"use client";

/**
 * Detect whether we're running inside a Capacitor native iOS app
 * vs the regular web browser.
 */
export function isNativeIOS(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor injects this on the window object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as unknown as Record<string, unknown>).Capacitor as
    | { isNativePlatform?: () => boolean; getPlatform?: () => string }
    | undefined;
  if (!cap?.isNativePlatform?.()) return false;
  return cap.getPlatform?.() === "ios";
}

export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as unknown as Record<string, unknown>).Capacitor as
    | { isNativePlatform?: () => boolean }
    | undefined;
  return cap?.isNativePlatform?.() === true;
}

/** Apple's subscription management deep link */
export const APPLE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";
