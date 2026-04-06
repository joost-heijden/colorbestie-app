"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "colorbestie:guest-prompt-dismissed";

type GuestAccountPromptProps = {
  /** Current UI language */
  lang?: string;
  /** Where to redirect after login */
  callbackUrl?: string;
  /** Visual variant */
  variant?: "banner" | "card";
};

export function GuestAccountPrompt({ lang, callbackUrl = "/app", variant = "card" }: GuestAccountPromptProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (!raw) return false;
      // Allow re-showing after 24h
      const ts = Number(raw);
      return Date.now() - ts < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const isDutch = lang === "nl";
  const isGerman = lang === "de";
  const isSpanish = lang === "es";
  const isFrench = lang === "fr";

  const title = isDutch ? "Maak een account aan" : isGerman ? "Erstelle ein Konto" : isSpanish ? "Crea una cuenta" : isFrench ? "Créer un compte" : "Create an account";
  const description = isDutch
    ? "Log in om je tekeningen op al je apparaten te bewaren en je aankopen te koppelen."
    : isGerman
      ? "Melde dich an, um deine Zeichnungen auf allen Geräten zu speichern und Käufe zu verknüpfen."
      : isSpanish
        ? "Inicia sesión para guardar tus dibujos en todos tus dispositivos y vincular tus compras."
        : isFrench
          ? "Connecte-toi pour sauvegarder tes dessins sur tous tes appareils et lier tes achats."
          : "Sign in to save your drawings across all your devices and link your purchases.";
  const ctaLabel = isDutch ? "Log in of maak account" : isGerman ? "Anmelden oder registrieren" : isSpanish ? "Iniciar sesión o registrarse" : isFrench ? "Se connecter ou créer un compte" : "Sign in or create account";
  const dismissLabel = isDutch ? "Later" : isGerman ? "Später" : isSpanish ? "Más tarde" : isFrench ? "Plus tard" : "Later";

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const encodedCallback = encodeURIComponent(callbackUrl);

  if (variant === "banner") {
    return (
      <div className="relative rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-weak)] p-4">
        <button type="button" onClick={handleDismiss} className="absolute right-3 top-3 text-[var(--muted)] hover:text-[var(--text)]">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <LogIn className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button asChild size="sm">
                <Link href={`/login?callbackUrl=${encodedCallback}`}>{ctaLabel}</Link>
              </Button>
              <button type="button" onClick={handleDismiss} className="text-xs text-[var(--muted)] underline underline-offset-2">
                {dismissLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-white p-5 shadow-soft">
      <button type="button" onClick={handleDismiss} className="absolute right-3 top-3 text-[var(--muted)] hover:text-[var(--text)]">
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-weak)]">
          <LogIn className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
        <div className="mt-4 flex items-center gap-3">
          <Button asChild size="sm">
            <Link href={`/login?callbackUrl=${encodedCallback}`}>{ctaLabel}</Link>
          </Button>
          <button type="button" onClick={handleDismiss} className="text-xs text-[var(--muted)] underline underline-offset-2">
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
