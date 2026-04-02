"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-auth-client";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  email?: string;
};

export function Topbar({
  title = "Cozy Marker Studio",
  subtitle = "Upload your sketch and color with more ease, less guessing.",
  email,
}: TopbarProps) {
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="card-premium px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Cozy coloring space
          </p>
          <h1 className="mt-2 text-2xl font-black text-[var(--text)] sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">{subtitle}</p>
        </div>

        <div className="relative">
          <Button variant="ghost" onClick={() => setOpen((v) => !v)} className="gap-2">
            <Menu className="h-4 w-4" />
            Account
          </Button>

          {open ? (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_12px_30px_-14px_var(--shadow)]">
              {email ? <p className="px-2 py-1 text-xs text-[var(--muted)]">{email}</p> : null}
              <Link href="/billing" className="block rounded-xl px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]" onClick={() => setOpen(false)}>
                Billing
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
