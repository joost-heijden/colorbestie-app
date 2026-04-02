import { PricingCard } from "@/components/pricing/pricing-card";
import { t } from "@/lib/i18n";
import type { UiLanguage } from "@/lib/ui-language";

type Plan = "monthly" | "yearly" | "lifetime";

type PricingGridProps = {
  onContinue: (plan: Plan) => void;
  loadingPlan?: Plan | null;
  disabled?: boolean;
  prices?: Partial<Record<Plan, string | null>>;
  lang: UiLanguage;
};

export function PricingGrid({ onContinue, loadingPlan = null, disabled = false, prices, lang }: PricingGridProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <PricingCard
        plan="monthly"
        name={t(lang, { nl: "Maandelijks", en: "Monthly", fr: "Mensuel", de: "Monatlich", es: "Mensual" })}
        price={prices?.monthly || "€4,99"}
        period={t(lang, { nl: "/ maand", en: "/ month", fr: "/ mois", de: "/ Monat", es: "/ mes" })}
        loading={loadingPlan === "monthly"}
        onContinue={onContinue}
        disabled={disabled}
        quotaNote={t(lang, { nl: "30 credits / maand", en: "30 credits / month", fr: "30 crédits / mois", de: "30 Credits / Monat", es: "30 créditos / mes" })}
        lang={lang}
      />

      <PricingCard
        plan="yearly"
        name={t(lang, { nl: "Jaarlijks", en: "Yearly", fr: "Annuel", de: "Jährlich", es: "Anual" })}
        price={prices?.yearly || "€49,99"}
        period={t(lang, { nl: "/ jaar", en: "/ year", fr: "/ an", de: "/ Jahr", es: "/ año" })}
        badge={t(lang, { nl: "Beste waarde", en: "Best value", fr: "Meilleure offre", de: "Bestes Angebot", es: "Mejor valor" })}
        highlight
        loading={loadingPlan === "yearly"}
        onContinue={onContinue}
        disabled={disabled}
        quotaNote={t(lang, { nl: "320 credits / jaar", en: "320 credits / year", fr: "320 crédits / an", de: "320 Credits / Jahr", es: "320 créditos / año" })}
        lang={lang}
      />

      <PricingCard
        plan="lifetime"
        name={t(lang, { nl: "Lifetime", en: "Lifetime", fr: "À vie", de: "Lebenslang", es: "De por vida" })}
        price={prices?.lifetime || "€119,99"}
        period={t(lang, { nl: "eenmalig", en: "once", fr: "une fois", de: "einmalig", es: "una vez" })}
        badge={t(lang, { nl: "Lifetime", en: "Lifetime", fr: "À vie", de: "Lebenslang", es: "De por vida" })}
        loading={loadingPlan === "lifetime"}
        onContinue={onContinue}
        disabled={disabled}
        quotaNote={t(lang, { nl: "700 credits / lifetime", en: "700 credits / lifetime", fr: "700 crédits / à vie", de: "700 Credits / lebenslang", es: "700 créditos / de por vida" })}
        lang={lang}
      />
    </section>
  );
}
