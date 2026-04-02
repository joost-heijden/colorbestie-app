import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { resolveUiLanguage } from "@/lib/ui-language";
import { t } from "@/lib/i18n";

export default async function WelcomeOfferPage() {
  const acceptLanguage = (await headers()).get("accept-language") || "";
  const uiLanguage = resolveUiLanguage(acceptLanguage.split(",")[0]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/mascot/scene-sit-rainbow.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-hero flex-col justify-end px-6 py-10 md:px-10 md:py-14">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            {t(uiLanguage, {
              nl: "Iets kleins, speciaal voor jou",
              en: "A little something just for you",
              fr: "Un petit quelque chose, juste pour toi",
              de: "Etwas Kleines, nur für dich",
              es: "Algo pequeñito, solo para ti",
            })}
          </p>

          <h1 className="mt-3 text-4xl font-black leading-[0.95] md:text-6xl">
            {t(uiLanguage, {
              nl: "Ontgrendel jouw volledige ColorBestie ervaring",
              en: "Unlock your full ColorBestie experience",
              fr: "Débloque toute ton expérience ColorBestie",
              de: "Schalte dein volles ColorBestie-Erlebnis frei",
              es: "Desbloquea toda tu experiencia ColorBestie",
            })}
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-white/85 md:text-xl">
            {t(uiLanguage, {
              nl: "Gebruik WELCOME50 voor 50% korting op je eerste maand en geef jezelf meer creatieve tijd, meer personalisatie en nog mooiere resultaten.",
              en: "Use WELCOME50 for 50% off your first month and give yourself more creative time, more personalization, and even more beautiful results.",
              fr: "Utilise WELCOME50 pour obtenir 50 % de réduction sur ton premier mois et offre-toi plus de temps créatif, plus de personnalisation et des résultats encore plus beaux.",
              de: "Verwende WELCOME50 für 50 % Rabatt auf deinen ersten Monat und gönn dir mehr kreative Zeit, mehr Personalisierung und noch schönere Ergebnisse.",
              es: "Usa WELCOME50 para obtener un 50 % de descuento en tu primer mes y date más tiempo creativo, más personalización y resultados aún más bonitos.",
            })}
          </p>

          <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {t(uiLanguage, {
                nl: "Jouw welkomstcode",
                en: "Your welcome code",
                fr: "Ton code de bienvenue",
                de: "Dein Willkommenscode",
                es: "Tu código de bienvenida",
              })}
            </p>
            <p className="mt-2 text-3xl font-black tracking-[0.18em]">WELCOME50</p>
            <p className="mt-2 text-sm text-white/80 md:text-base">
              {t(uiLanguage, {
                nl: "Gebruik WELCOME50 bij het afrekenen voor 50% korting op je eerste maand van het maandabonnement.",
                en: "Use WELCOME50 at checkout for 50% off your first month on the monthly plan.",
                fr: "Utilise WELCOME50 au moment du paiement pour obtenir 50 % de réduction sur ton premier mois de l'abonnement mensuel.",
                de: "Verwende WELCOME50 beim Checkout für 50 % Rabatt auf deinen ersten Monat im Monatsabo.",
                es: "Usa WELCOME50 al pagar para obtener un 50 % de descuento en tu primer mes del plan mensual.",
              })}
            </p>
          </div>

          <div className="mt-6 space-y-2 text-sm text-white/85 md:text-base">
            <p>• {t(uiLanguage, {
              nl: "Meer pagina's waar je echt blij van wordt",
              en: "More pages you'll truly love",
              fr: "Plus de pages que tu vas vraiment aimer",
              de: "Mehr Seiten, die du wirklich lieben wirst",
              es: "Más páginas que realmente te encantarán",
            })}</p>
            <p>• {t(uiLanguage, {
              nl: "Meer ruimte om alles nóg persoonlijker te maken",
              en: "More room to make everything feel even more personal",
              fr: "Plus d'espace pour rendre chaque résultat encore plus personnel",
              de: "Mehr Spielraum, um alles noch persönlicher zu machen",
              es: "Más espacio para hacer que todo se sienta aún más personal",
            })}</p>
            <p>• {t(uiLanguage, {
              nl: "Meer creatieve tijd helemaal voor jezelf",
              en: "More creative time just for you",
              fr: "Plus de temps créatif rien que pour toi",
              de: "Mehr kreative Zeit nur für dich",
              es: "Más tiempo creativo solo para ti",
            })}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-[var(--accent-bg)] text-[var(--text)] hover:bg-[var(--accent-bg-hover)]">
              <Link href="/paywall">
                {t(uiLanguage, {
                  nl: "Claim mijn welkomstcadeautje",
                  en: "Claim my welcome gift",
                  fr: "Je profite de mon cadeau",
                  de: "Mein Willkommensgeschenk sichern",
                  es: "Quiero mi regalo de bienvenida",
                })}
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border border-white/20 bg-white/10 text-white hover:bg-white/15">
              <Link href="/app/upload">
                {t(uiLanguage, {
                  nl: "Ik gebruik eerst mijn gratis poging",
                  en: "I'll use my free try first",
                  fr: "Je vais d'abord utiliser mon essai gratuit",
                  de: "Ich nutze zuerst meinen kostenlosen Versuch",
                  es: "Primero usaré mi intento gratis",
                })}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

