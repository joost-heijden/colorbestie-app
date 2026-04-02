"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    workbox?: {
      addEventListener: (event: string, callback: (event: unknown) => void) => void;
      messageSkipWaiting: () => void;
    };
  }
}

export function PwaUpdater() {
  const shownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Emergency stability mode: clear stale SW/cache after rapid rollback cycles.
    const emergencyReset = (process.env.NEXT_PUBLIC_PWA_EMERGENCY_RESET ?? "true") === "true";
    if (emergencyReset && "serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });

      if ("caches" in window) {
        void caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
      }
    }

    const handler = () => {
      if (shownRef.current) return;
      shownRef.current = true;

      toast("Update available", {
        action: {
          label: "Refresh",
          onClick: () => {
            if (window.workbox) {
              window.workbox.messageSkipWaiting();
            }
            window.location.reload();
          },
        },
      });
    };

    window.workbox?.addEventListener("waiting", handler);

    navigator.serviceWorker?.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  return null;
}
