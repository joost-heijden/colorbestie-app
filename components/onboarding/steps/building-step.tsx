"use client";

import { useEffect, useState } from "react";

const BUILDING_STEPS_BY_LANG = {
  en: [
    "Saving marker inventory",
    "Saving style preferences",
    "Preparing your first palette",
  ],
  nl: [
    "Stifteninventaris opslaan",
    "Stijlvoorkeuren opslaan",
    "Eerste palette voorbereiden",
  ],
  de: [
    "Marker-Bestand wird gespeichert",
    "Stilvorlieben werden gespeichert",
    "Deine erste Palette wird vorbereitet",
  ],
  es: [
    "Guardando inventario de marcadores",
    "Guardando preferencias de estilo",
    "Preparando tu primera paleta",
  ],
  fr: [
    "Enregistrement de l'inventaire des markers",
    "Enregistrement des préférences de style",
    "Préparation de ta première palette",
  ],
} as const;

export function BuildingStep({ language, onDone }: { language: string; onDone: () => void }) {
  const lang = language === "nl" || language === "de" || language === "es" || language === "fr" ? language : "en";
  const BUILDING_STEPS = BUILDING_STEPS_BY_LANG[lang];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const revealTimer = window.setInterval(() => {
      setVisibleCount((prev) => Math.min(prev + 1, BUILDING_STEPS.length));
    }, 320);

    const doneTimer = window.setTimeout(onDone, 1800);

    return () => {
      window.clearInterval(revealTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-6">
        <h1 className="text-3xl font-black leading-[0.95] text-[var(--text)] md:text-5xl">{lang === "nl" ? "Even instellen..." : lang === "de" ? "Wird eingerichtet..." : lang === "es" ? "Configurando todo..." : lang === "fr" ? "Configuration en cours..." : "Setting things up..."}</h1>
        <p className="mt-2 text-base text-[var(--muted)] md:mt-4 md:text-2xl">{lang === "nl" ? "Je workspace personaliseren op basis van je voorkeuren." : lang === "de" ? "Dein Workspace wird anhand deiner Vorlieben personalisiert." : lang === "es" ? "Personalizando tu espacio según tus preferencias." : lang === "fr" ? "Personnalisation de ton espace selon tes préférences." : "Personalizing your workspace based on your preferences."}</p>

        <ul className="mt-4 space-y-2 text-base text-[#2f8f5b] md:mt-5 md:text-2xl">
          {BUILDING_STEPS.map((step, idx) => {
            const isVisible = idx < visibleCount;
            return (
              <li
                key={step}
                className={`flex items-center gap-3 transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f8f5b]/12 text-[#2f8f5b]">
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="M3 8.5L6.2 11.5L13 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{step}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
