import { t } from "@/lib/i18n";
import { resolveUiLanguage } from "@/lib/ui-language";

const GOALS = ["Finish pages faster", "Better blending", "More realistic palettes", "Use my real marker sets"] as const;

type Props = {
  language: string;
  selected: string[];
  setSelected: (v: string[]) => void;
};

export function GoalsStep({ language, selected, setSelected }: Props) {
  const uiLanguage = resolveUiLanguage(language);
  const toggle = (goal: string) => {
    if (selected.includes(goal)) setSelected(selected.filter((g) => g !== goal));
    else setSelected([...selected, goal]);
  };

  const goalLabel = (goal: string) => {
    if (goal === "Finish pages faster") return t(uiLanguage, { nl: "Kleurplaten sneller afmaken", en: "Finish pages faster", fr: "Terminer les pages plus vite", de: "Seiten schneller fertigstellen", es: "Terminar páginas más rápido" });
    if (goal === "Better blending") return t(uiLanguage, { nl: "Betere blends", en: "Better blending", fr: "Meilleurs fondus", de: "Besseres Verblenden", es: "Mezclas más suaves" });
    if (goal === "More realistic palettes") return t(uiLanguage, { nl: "Realistischere palettes", en: "More realistic palettes", fr: "Palettes plus réalistes", de: "Realistischere Paletten", es: "Paletas más realistas" });
    return t(uiLanguage, { nl: "Mijn echte stiftensets gebruiken", en: "Use my real marker sets", fr: "Utiliser mes vrais sets de marqueurs", de: "Meine echten Marker-Sets nutzen", es: "Usar mis sets reales de marcadores" });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-6">
        <h1 className="text-3xl font-black leading-[0.95] text-[var(--text)] md:text-5xl">{t(uiLanguage, { nl: "Wat wil je het liefst?", en: "What do you want most?", fr: "Que veux-tu le plus ?", de: "Was möchtest du am meisten?", es: "¿Qué quieres más?" })}</h1>
        <p className="mt-2 text-base text-[var(--muted)] md:mt-4 md:text-2xl">{t(uiLanguage, { nl: "Kies je doelen zodat we kunnen optimaliseren voor snellere kleurkeuzes en betere eindresultaten.", en: "Pick your goals so we can optimize for faster color decisions and better finished pages.", fr: "Choisis tes objectifs pour optimiser des choix de couleur plus rapides et de meilleurs résultats.", de: "Wähle deine Ziele, damit wir schnellere Farbentscheidungen und bessere Ergebnisse optimieren können.", es: "Elige tus objetivos para optimizar decisiones de color más rápidas y mejores resultados finales." })}</p>
        <div className="mt-4 grid gap-2 md:mt-5 md:gap-3">
          {GOALS.map((goal) => (
            <button key={goal} type="button" onClick={() => toggle(goal)} className={`min-h-10 rounded-2xl border px-4 py-2 text-left text-base md:h-14 md:text-xl ${selected.includes(goal) ? "border-black bg-black text-white" : "border-[var(--border)] bg-white text-[var(--text)]"}`}>
              {goalLabel(goal)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
