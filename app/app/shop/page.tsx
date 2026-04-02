"use client";

import { useColorBestie } from "@/components/app/colorbestie-provider";
import { t } from "@/lib/i18n";

export default function ShopPage() {
  const { uiLanguage } = useColorBestie();

  return (
    <div className="px-5 pt-4 pb-2 md:px-8">
      <h1 className="text-2xl font-black text-[var(--text)]">{t(uiLanguage, { nl: "Shop", en: "Shop", fr: "Boutique", de: "Shop", es: "Tienda" })}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{t(uiLanguage, { nl: "Binnenkort ✨", en: "Coming soon ✨", fr: "Bientôt ✨", de: "Bald verfügbar ✨", es: "Próximamente ✨" })}</p>
    </div>
  );
}
