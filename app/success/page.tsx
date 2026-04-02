"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { fromNavigatorLanguage, t } from "@/lib/i18n";
import type { UiLanguage } from "@/lib/ui-language";

type MeResponse = {
  access?: {
    entitled?: boolean;
  };
};

type SessionSummaryResponse = {
  number?: string;
  total?: number;
};

declare global {
  interface Window {
    goaffproTrackConversion?: (order: { number: string; total: number }) => void;
    goaffpro_order?: { number: string; total: number };
  }
}

const MAX_TRIES = 20;
const INTERVAL_MS = 1500;

export default function SuccessPage() {
  const router = useRouter();
  const conversionTracked = useRef(false);
  const [tries, setTries] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [lang, setLang] = useState<UiLanguage>("en");

  useEffect(() => {
    setLang(fromNavigatorLanguage(navigator.language));
  }, []);

  useEffect(() => {
    if (conversionTracked.current) return;
    const sessionId = new URLSearchParams(window.location.search).get("session_id") || "";
    if (!sessionId) return;

    let cancelled = false;

    async function trackConversion() {
      const response = await fetch(`/api/stripe/session-summary?session_id=${encodeURIComponent(sessionId)}`, {
        cache: "no-store",
      });
      if (!response.ok) return;

      const data = (await response.json()) as SessionSummaryResponse;
      if (!data.number || typeof data.total !== "number") return;

      const order = { number: data.number, total: data.total };
      window.goaffpro_order = order;

      for (let i = 0; i < 15; i++) {
        if (cancelled) return;
        if (typeof window.goaffproTrackConversion === "function") {
          window.goaffproTrackConversion(order);
          conversionTracked.current = true;
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    void trackConversion();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      for (let i = 1; i <= MAX_TRIES; i++) {
        if (cancelled) return;

        setTries(i);

        await fetch("/api/stripe/restore", { method: "POST" }).catch(() => null);

        const response = await fetch("/api/me", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as MeResponse;
          if (data.access?.entitled) {
            router.replace("/app");
            return;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
      }

      if (!cancelled) setTimedOut(true);
    }

    void poll();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-hero items-center px-6 py-16 md:px-10">
      <section className="card-soft mx-auto w-full max-w-2xl p-8 text-center md:p-12">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{t(lang, { nl: "Betaling ontvangen", en: "Payment received", fr: "Paiement reçu", de: "Zahlung erhalten", es: "Pago recibido" })}</h1>
        <p className="mt-4 text-[var(--muted)]">{t(lang, { nl: "Je toegang wordt gesynchroniseerd…", en: "Syncing your access…", fr: "Synchronisation de votre accès…", de: "Dein Zugriff wird synchronisiert…", es: "Sincronizando tu acceso…" })}</p>

        {!timedOut ? (
          <p className="mt-6 text-sm text-[var(--muted)]">{`${t(lang, { nl: "Status controleren", en: "Checking status", fr: "Vérification du statut", de: "Status wird geprüft", es: "Comprobando estado" })} (${tries}/${MAX_TRIES})`}</p>
        ) : (
          <div className="mt-6">
            <p className="text-sm text-[var(--muted)]">{t(lang, { nl: "Nog bezig met synchroniseren, probeer te verversen.", en: "Still syncing, try refreshing.", fr: "Toujours en synchronisation, essayez d'actualiser.", de: "Synchronisierung läuft noch, bitte aktualisieren.", es: "Aún sincronizando, prueba a recargar." })}</p>
            <Button asChild className="mt-4">
              <Link href="/app">{t(lang, { nl: "Ga naar app", en: "Go to app", fr: "Aller à l'app", de: "Zur App", es: "Ir a la app" })}</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
