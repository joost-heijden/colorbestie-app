import { t } from "@/lib/i18n";
import { resolveUiLanguage } from "@/lib/ui-language";

type SkillLevel = "beginner" | "learning" | "experienced" | "pro";

const OPTIONS: SkillLevel[] = ["beginner", "learning", "experienced", "pro"];

export function SkillStep({ language, value, onChange }: { language: string; value: SkillLevel; onChange: (v: SkillLevel) => void }) {
  const uiLanguage = resolveUiLanguage(language);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-6">
        <h1 className="text-3xl font-black leading-[0.95] text-[var(--text)] md:text-5xl">{t(uiLanguage, { nl: "Jouw kleurniveau", en: "Your coloring level", fr: "Votre niveau de coloriage", de: "Dein Kolorierungsniveau", es: "Tu nivel de coloreado" })}</h1>
        <div className="mt-4 flex flex-wrap gap-2 md:mt-5 md:gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`h-10 rounded-full border px-4 text-base capitalize md:h-12 md:px-5 md:text-2xl ${option === value ? "border-black bg-black text-white" : "border-[var(--border)] bg-white text-[var(--text)]"}`}
            >
              {option === "beginner" ? t(uiLanguage, { nl: "beginner", en: "beginner", fr: "débutant", de: "anfänger", es: "principiante" }) : option === "learning" ? t(uiLanguage, { nl: "lerend", en: "learning", fr: "en apprentissage", de: "lernend", es: "aprendiendo" }) : option === "experienced" ? t(uiLanguage, { nl: "ervaren", en: "experienced", fr: "expérimenté", de: "erfahren", es: "con experiencia" }) : "pro"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
