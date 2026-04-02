"use client";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { UiLanguage } from "@/lib/ui-language";

type Plan = "monthly" | "yearly" | "lifetime";

type PricingCardProps = {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  plan: Plan;
  loading?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  showCancelAnytime?: boolean;
  quotaNote?: string;
  lang: UiLanguage;
  onContinue: (plan: Plan) => void;
};

export function PricingCard({ name, price, period, badge, plan, loading, disabled, highlight, showCancelAnytime = true, quotaNote, lang, onContinue }: PricingCardProps) {
  return (
    <div className={`rounded-2xl border bg-white p-4 ${highlight ? "border-[var(--accent)] shadow-soft" : "border-[var(--border)]"}`}>
      {badge ? <p className="text-xs font-semibold text-[var(--accent)]">{badge}</p> : null}
      <h3 className="mt-1 text-lg font-bold text-[var(--text)]">{name}</h3>
      <p className="mt-1 text-2xl font-black text-[var(--text)]">
        {price} <span className="text-sm font-medium text-[var(--muted)]">{period || ""}</span>
      </p>
      {showCancelAnytime ? <p className="mt-2 text-xs text-[var(--muted)]">{t(lang, { nl: "Altijd opzegbaar.", en: "Cancel anytime.", fr: "Annulez à tout moment.", de: "Jederzeit kündbar.", es: "Cancela cuando quieras." })}</p> : null}
      <Button className="mt-3 w-full" onClick={() => onContinue(plan)} disabled={loading || disabled}>
        {loading ? t(lang, { nl: "Laden...", en: "Loading...", fr: "Chargement...", de: "Lädt...", es: "Cargando..." }) : t(lang, { nl: "Kies plan", en: "Choose plan", fr: "Choisir ce plan", de: "Plan wählen", es: "Elegir plan" })}
      </Button>
      {quotaNote ? <p className="mt-2 text-center text-[11px] text-[var(--muted)]">{quotaNote}</p> : null}
    </div>
  );
}
