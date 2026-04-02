"use client";

import { Toaster } from "sonner";

export function SonnerProvider() {
  return (
    <Toaster
      position="top-center"
      richColors={false}
      toastOptions={{
        style: {
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          boxShadow: "0 10px 30px -14px var(--shadow)",
        },
      }}
    />
  );
}
