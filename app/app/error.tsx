"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fromNavigatorLanguage, t } from "@/lib/i18n";
import { captureApiError } from "@/lib/monitoring";
import type { UiLanguage } from "@/lib/ui-language";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<UiLanguage>("en");

  useEffect(() => {
    setLang(fromNavigatorLanguage(navigator.language));
  }, []);

  useEffect(() => {
    captureApiError(error, {
      area: "app.error-boundary",
      event: "render_failed",
      meta: { digest: error.digest },
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-hero items-center px-6 py-16 md:px-10">
      <section className="card-soft mx-auto w-full max-w-2xl p-8 text-center md:p-12">
        <AlertTriangle className="mx-auto h-8 w-8 text-[var(--accent)]" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--text)]">{t(lang, {
          nl: "Er ging iets mis",
          en: "Something went wrong",
          fr: "Une erreur s'est produite",
          de: "Etwas ist schiefgelaufen",
          es: "Algo salió mal",
        })}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t(lang, {
          nl: "Probeer opnieuw. Blijft het probleem bestaan, neem dan contact op met support.",
          en: "Please retry. If the issue persists, contact support.",
          fr: "Veuillez réessayer. Si le problème persiste, contactez le support.",
          de: "Bitte versuche es erneut. Wenn das Problem bleibt, kontaktiere den Support.",
          es: "Inténtalo de nuevo. Si el problema persiste, contacta con soporte.",
        })}</p>
        <Button className="mt-6" onClick={reset}>
          {t(lang, {
            nl: "Probeer opnieuw",
            en: "Try again",
            fr: "Réessayer",
            de: "Erneut versuchen",
            es: "Reintentar",
          })}
        </Button>
      </section>
    </main>
  );
}
