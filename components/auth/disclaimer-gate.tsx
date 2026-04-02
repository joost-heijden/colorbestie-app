"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fromNavigatorLanguage, t } from "@/lib/i18n";
import type { UiLanguage } from "@/lib/ui-language";

type MeResponse = {
  disclaimer?: {
    accepted?: boolean;
  };
};

export function DisclaimerGate() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("nl");

  useEffect(() => {
    setUiLanguage(fromNavigatorLanguage(navigator.language));

    let cancelled = false;

    const load = async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as MeResponse;
      if (!cancelled && !data.disclaimer?.accepted) {
        setOpen(true);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const accept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/disclaimer/accept", { method: "POST" });
      if (res.ok) {
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 md:items-center">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-[var(--text)]">{t(uiLanguage, { nl: "Belangrijk: AI-preview & gebruikskennisgeving", en: "Important: AI preview & usage notice", fr: "Important : aperçu IA et notice d'utilisation", de: "Wichtig: KI-Vorschau & Nutzungshinweis", es: "Importante: vista previa IA y aviso de uso" })}</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {t(uiLanguage, {
            nl: "ColorBestie genereert een AI-preview op basis van je upload. Deze output is alleen ter inspiratie en kan afwijken van je verwachting.",
            en: "ColorBestie generates an AI-based preview from your upload. This output is for inspiration only and may differ from your expectations.",
            fr: "ColorBestie génère un aperçu basé sur l'IA à partir de votre upload. Ce résultat est uniquement inspirant et peut différer de vos attentes.",
            de: "ColorBestie erstellt anhand deines Uploads eine KI-basierte Vorschau. Dieses Ergebnis dient nur zur Inspiration und kann von deinen Erwartungen abweichen.",
            es: "ColorBestie genera una vista previa con IA a partir de tu subida. Este resultado es solo inspiracional y puede diferir de tus expectativas.",
          })}
        </p>

        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
          <li>{t(uiLanguage, { nl: "Je bevestigt dat je toestemming hebt om geüploade afbeeldingen te gebruiken.", en: "You confirm you have permission to use uploaded images.", fr: "Vous confirmez avoir l'autorisation d'utiliser les images importées.", de: "Du bestätigst, dass du die Berechtigung zur Nutzung hochgeladener Bilder hast.", es: "Confirmas que tienes permiso para usar las imágenes subidas." })}</li>
          <li>{t(uiLanguage, { nl: "Je uploadt geen content die rechten van derden schendt.", en: "You won't upload content that violates third-party rights.", fr: "Vous n'importerez pas de contenu qui enfreint les droits de tiers.", de: "Du lädst keine Inhalte hoch, die Rechte Dritter verletzen.", es: "No subirás contenido que vulnere derechos de terceros." })}</li>
          <li>{t(uiLanguage, { nl: "ColorBestie is niet aansprakelijk voor claims door ongeautoriseerde uploads.", en: "ColorBestie is not liable for claims from unauthorized uploads.", fr: "ColorBestie n'est pas responsable des réclamations liées aux uploads non autorisés.", de: "ColorBestie haftet nicht für Ansprüche aus nicht autorisierten Uploads.", es: "ColorBestie no es responsable de reclamaciones por subidas no autorizadas." })}</li>
        </ul>

        <p className="mt-3 text-xs text-[var(--muted)]">
          {t(uiLanguage, { nl: "Door verder te gaan ga je akkoord met onze voorwaarden en privacyverklaring.", en: "By continuing, you agree to our terms and privacy policy.", fr: "En continuant, vous acceptez nos conditions et notre politique de confidentialité.", de: "Wenn du fortfährst, stimmst du unseren Bedingungen und unserer Datenschutzrichtlinie zu.", es: "Al continuar, aceptas nuestros términos y nuestra política de privacidad." })}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" onClick={accept} disabled={loading}>
            {loading ? t(uiLanguage, { nl: "Opslaan...", en: "Saving...", fr: "Enregistrement...", de: "Speichern...", es: "Guardando..." }) : t(uiLanguage, { nl: "Ik begrijp het", en: "I understand", fr: "J'ai compris", de: "Ich verstehe", es: "Entiendo" })}
          </Button>
          <Button asChild variant="ghost">
            <Link href="/privacy" target="_blank">
              Privacy
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/verwerkingsovereenkomst" target="_blank">
              DPA
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
