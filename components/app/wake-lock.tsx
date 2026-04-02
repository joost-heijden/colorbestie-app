"use client";

import { useEffect, useState } from "react";

/**
 * Global wake lock component.
 * Reads "colorbestie:keep-screen-on" from localStorage.
 * When enabled, prevents the screen from turning off using the Screen Wake Lock API.
 */
export function WakeLock() {
  const [enabled, setEnabled] = useState(false);

  // Listen for changes (including from other tabs / profile page toggle)
  useEffect(() => {
    const check = () => {
      setEnabled(localStorage.getItem("colorbestie:keep-screen-on") === "true");
    };

    check();

    // Re-check on storage events (cross-tab) and on focus (same-tab toggle)
    window.addEventListener("storage", check);
    window.addEventListener("focus", check);

    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("focus", check);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let released = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        lock.addEventListener("release", () => {
          lock = null;
        });
      } catch {
        // Not supported or denied
      }
    };

    void acquire();

    const handleVisibility = () => {
      if (!released && document.visibilityState === "visible") {
        void acquire();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (lock) void lock.release();
    };
  }, [enabled]);

  return null; // No UI — purely functional
}
