import type { UiLanguage } from "@/lib/ui-language";

export type I18nText = Record<UiLanguage, string>;

export function t(lang: UiLanguage, text: I18nText): string {
  return text[lang] ?? text.en;
}

export function uiLocale(lang: UiLanguage): string {
  if (lang === "nl") return "nl-NL";
  if (lang === "fr") return "fr-FR";
  if (lang === "de") return "de-DE";
  if (lang === "es") return "es-ES";
  return "en-US";
}

export function fromNavigatorLanguage(value?: string | null): UiLanguage {
  const v = (value || "").toLowerCase();
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("de")) return "de";
  if (v.startsWith("es")) return "es";
  if (v.startsWith("en")) return "en";
  return "nl";
}
