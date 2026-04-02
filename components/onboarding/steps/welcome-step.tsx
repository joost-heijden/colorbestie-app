import { t } from "@/lib/i18n";
import { resolveUiLanguage } from "@/lib/ui-language";

type Props = {
  language: string;
  displayName: string;
  setDisplayName: (v: string) => void;
};

export function WelcomeStep({ language, displayName, setDisplayName }: Props) {
  const uiLanguage = resolveUiLanguage(language);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4 md:p-6">
        <h1 className="text-3xl font-black leading-[0.95] text-[var(--text)] md:text-5xl">{t(uiLanguage, { nl: "Hoe mogen we je noemen?", en: "What should we call you?", fr: "Comment devons-nous vous appeler ?", de: "Wie sollen wir dich nennen?", es: "¿Cómo debemos llamarte?" })}</h1>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t(uiLanguage, { nl: "Jouw naam", en: "Your name", fr: "Votre nom", de: "Dein Name", es: "Tu nombre" })}
          className="mt-4 h-10 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-base md:mt-6 md:h-14 md:text-xl"
        />
        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3 text-base text-[var(--muted)] md:mt-4 md:p-4 md:text-xl">
          {t(uiLanguage, {
            nl: "We gebruiken dit om je flow te personaliseren voor snellere kleurkeuzes en mooiere eindresultaten.",
            en: "We use this to personalize your flow for faster color decisions and better finished pages.",
            fr: "Nous utilisons cela pour personnaliser votre flow, afin de choisir plus vite les couleurs et d'obtenir de meilleurs résultats.",
            de: "Damit personalisieren wir deinen Flow für schnellere Farbentscheidungen und bessere Endergebnisse.",
            es: "Usamos esto para personalizar tu flujo, tomar decisiones de color más rápidas y lograr mejores resultados finales.",
          })}
        </div>
      </div>
    </div>
  );
}
