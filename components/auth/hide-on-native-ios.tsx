"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isNativeIOS } from "@/lib/platform";

/** Hides its children when running inside the native iOS Capacitor shell. */
export function HideOnNativeIOS({ children }: { children: ReactNode }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(isNativeIOS());
  }, []);

  if (hide) return null;
  return <>{children}</>;
}
