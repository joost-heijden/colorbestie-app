"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isNative } from "@/lib/native-bridge";

/** Renders children only when NOT running inside a Capacitor native shell. */
export function PwaGuard({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (isNative()) setShow(false);
  }, []);

  return show ? <>{children}</> : null;
}
