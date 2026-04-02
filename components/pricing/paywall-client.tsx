"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { MascotBubble } from "@/components/brand/mascot-bubble";
import { PricingGrid } from "@/components/pricing/pricing-grid";
import { Button } from "@/components/ui/button";
import { DisclaimerGate } from "@/components/auth/disclaimer-gate";
import { MARKER_SELECTION_KEY, type MarkerSelection } from "@/lib/marker-catalog";
import { fromNavigatorLanguage } from "@/lib/i18n";
import type { UiLanguage } from "@/lib/ui-language";
import { isNativeIOS } from "@/lib/platform";
import {
  configureRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  RC_ENTITLEMENT_ID,
  type RCOffering,
  type RCPackage,
} from "@/lib/revenuecat";

type Plan = "monthly" | "yearly" | "lifetime";
type CreditPack = "pack_10" | "pack_50" | "pack_100";

const RC_CREDIT_PACK_IDS: Record<CreditPack, string> = {
  pack_10: "credits_10",
  pack_50: "credits_50",
  pack_100: "credits_100",
} as const;

type PaywallClientProps = {
  email?: string;
  alreadyUnlocked: boolean;
  userId?: string;
};

export function PaywallClient({ email, alreadyUnlocked, userId }: PaywallClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [restoringAccess, setRestoringAccess] = useState(false);
  const [markerSelections, setMarkerSelections] = useState<MarkerSelection[]>([]);
  const [stripePrices, setStripePrices] = useState<Partial<Record<Plan, string | null>>>({});
  const [lang, setLang] = useState<UiLanguage>("en");
  const [claimingCredits, setClaimingCredits] = useState(false);
  const [claimedSessionId, setClaimedSessionId] = useState<string | null>(null);
  const [loadingCreditsPack, setLoadingCreditsPack] = useState<CreditPack | null>(null);
  const [creditsPackMessage, setCreditsPackMessage] = useState<string | null>(null);

  // RevenueCat state (native iOS only)
  const [isNative, setIsNative] = useState(false);
  const [rcOffering, setRcOffering] = useState<RCOffering | null>(null);
  const [rcReady, setRcReady] = useState(false);

  const isDutch = lang === "nl";
  const isGerman = lang === "de";
  const isSpanish = lang === "es";
  const isFrench = lang === "fr";

  // --- Detect platform + initialise RevenueCat on native iOS ---
  useEffect(() => {
    const native = isNativeIOS();
    setIsNative(native);

    if (native) {
      void (async () => {
        try {
          // Configure with userId when available; uses anonymous ID otherwise.
          // Products must load even before the user has logged in.
          await configureRevenueCat(userId);
          const offering = await getOfferings();
          if (offering) {
            setRcOffering(offering);
            setRcReady(true);
          } else {
            console.warn("[paywall] RevenueCat returned no offerings");
            toast(isDutch ? "Producten konden niet geladen worden. Probeer later opnieuw." : isGerman ? "Produkte konnten nicht geladen werden. Bitte versuche es später erneut." : isSpanish ? "No se pudieron cargar los productos. Inténtalo más tarde." : "Could not load products. Please try again later.");
          }
        } catch (err) {
          console.error("[paywall] RevenueCat init failed:", err);
          toast(isDutch ? "Er ging iets mis bij het laden van de producten." : isGerman ? "Beim Laden der Produkte ist ein Fehler aufgetreten." : isSpanish ? "Algo salió mal al cargar los productos." : "Something went wrong loading products.");
        }
      })();
    }
  }, [userId]);

  // --- Marker selections from localStorage ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MARKER_SELECTION_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as MarkerSelection | MarkerSelection[];
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((item) => item?.brand && item?.series && item?.setSize);
        if (valid.length) setMarkerSelections(valid);
        return;
      }

      if (parsed?.brand && parsed?.series && parsed?.setSize) {
        setMarkerSelections([parsed]);
      }
    } catch {
      // ignore malformed localStorage
    }
  }, []);

  // --- Auto-restore on mount ---
  useEffect(() => {
    if (alreadyUnlocked) return;
    void restoreAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyUnlocked]);

  // --- Detect language ---
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setLang(fromNavigatorLanguage(navigator.language));
  }, []);

  // --- Stripe: claim credits from URL param (web only) ---
  useEffect(() => {
    if (typeof window === "undefined" || isNative) return;
    const sessionId = new URLSearchParams(window.location.search).get("credits_session_id");
    if (!sessionId || claimingCredits || claimedSessionId === sessionId) return;

    let cancelled = false;
    (async () => {
      setClaimingCredits(true);
      try {
        const response = await fetch("/api/stripe/credits-claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          applied?: boolean;
          creditsAdded?: number;
          error?: string;
        };
        if (cancelled) return;
        if (response.ok && payload.ok) {
          toast(payload.applied ? (isDutch ? `Credits toegevoegd: +${payload.creditsAdded ?? 0}` : isGerman ? `Credits hinzugefügt: +${payload.creditsAdded ?? 0}` : isSpanish ? `Créditos añadidos: +${payload.creditsAdded ?? 0}` : isFrench ? `Crédits ajoutés : +${payload.creditsAdded ?? 0}` : `Credits added: +${payload.creditsAdded ?? 0}`) : (isDutch ? "Credits waren al toegevoegd." : isGerman ? "Credits wurden bereits hinzugefügt." : isSpanish ? "Los créditos ya se habían añadido." : isFrench ? "Les crédits avaient déjà été ajoutés." : "Credits were already added."));
          window.setTimeout(() => {
            window.location.href = "/app";
          }, 300);
        } else {
          toast(payload.error || (isDutch ? "Credits claimen mislukt." : isGerman ? "Credits konnten nicht beansprucht werden." : isSpanish ? "No se pudieron reclamar los créditos." : "Could not claim credits."));
        }
      } catch {
        if (!cancelled) toast(isDutch ? "Credits claimen mislukt." : isGerman ? "Credits konnten nicht beansprucht werden." : isSpanish ? "No se pudieron reclamar los créditos." : "Could not claim credits.");
      } finally {
        if (!cancelled) {
          setClaimingCredits(false);
          setClaimedSessionId(sessionId);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [claimingCredits, claimedSessionId, isNative]);

  // --- Stripe: fetch prices (web only) ---
  useEffect(() => {
    if (isNative) return;
    void (async () => {
      try {
        const res = await fetch("/api/stripe/prices", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          prices?: {
            monthly?: { amount?: string | null } | null;
            yearly?: { amount?: string | null } | null;
            lifetime?: { amount?: string | null } | null;
          } | null;
        };
        if (!data.prices) return;
        setStripePrices({
          monthly: data.prices.monthly?.amount ?? null,
          yearly: data.prices.yearly?.amount ?? null,
          lifetime: data.prices.lifetime?.amount ?? null,
        });
      } catch {
        // keep fallback UI prices
      }
    })();
  }, [isNative]);

  // ---------------------------------------------------------------------------
  // Restore access — branches on platform
  // ---------------------------------------------------------------------------
  const restoreAccess = async () => {
    try {
      setRestoringAccess(true);

      if (isNative) {
        // RevenueCat restore
        const customerInfo = await restorePurchases();
        if (customerInfo && RC_ENTITLEMENT_ID in (customerInfo.entitlements?.active ?? {})) {
          // Sync to our backend
          await fetch("/api/revenuecat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rcUserId: userId }),
          });
          toast(isDutch ? "Toegang hersteld. Herladen..." : isGerman ? "Zugang wiederhergestellt. Neu laden..." : isSpanish ? "Acceso restaurado. Recargando..." : "Access restored. Reloading...");
          window.location.reload();
          return;
        }
        toast(isDutch ? "Nog geen passende betaalde toegang gevonden." : isGerman ? "Noch kein passender bezahlter Zugang gefunden." : isSpanish ? "Aún no se encontró acceso de pago." : "No matching paid access found.");
        return;
      }

      // Stripe restore (web)
      const response = await fetch("/api/stripe/restore", { method: "POST" });
      if (!response.ok) throw new Error("restore_failed");

      const data = (await response.json()) as { restored?: boolean };
      if (data.restored) {
        toast(isDutch ? "Toegang hersteld. Herladen..." : isGerman ? "Zugang wiederhergestellt. Neu laden..." : isSpanish ? "Acceso restaurado. Recargando..." : "Access restored. Reloading...");
        window.location.reload();
        return;
      }

      toast(isDutch ? "Nog geen passende betaalde toegang gevonden voor dit account." : isGerman ? "Noch kein passender bezahlter Zugang für dieses Konto gefunden." : isSpanish ? "Aún no se encontró acceso de pago para esta cuenta." : "No matching paid access found for this account yet.");
    } catch {
      toast(isDutch ? "Toegang herstellen lukt nu niet." : isGerman ? "Zugang kann gerade nicht wiederhergestellt werden." : isSpanish ? "No se pudo restaurar el acceso ahora mismo." : "Could not restore access right now.");
    } finally {
      setRestoringAccess(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Buy credits — RevenueCat on iOS, Stripe on web
  // ---------------------------------------------------------------------------
  const buyCredits = async (pack: CreditPack) => {
    try {
      setCreditsPackMessage(null);
      setLoadingCreditsPack(pack);

      if (isNative && rcOffering) {
        // --- RevenueCat purchase (native iOS) ---
        // Find credit pack in availablePackages by identifier
        const targetId = RC_CREDIT_PACK_IDS[pack];
        const pkg = rcOffering.availablePackages.find(
          (p) => p.identifier === targetId || p.product.identifier.includes(targetId),
        );

        if (!pkg) {
          const msg = isDutch ? "Dit creditpakket is niet beschikbaar." : isGerman ? "Dieses Credit-Paket ist nicht verfügbar." : isSpanish ? "Este paquete de créditos no está disponible." : "This credit pack is not available.";
          setCreditsPackMessage(msg);
          toast(msg);
          return;
        }

        const result = await purchasePackage(pkg);
        if (result.userCancelled) return;

        if (result.success) {
          await fetch("/api/revenuecat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rcUserId: userId }),
          });
          toast(isDutch ? "Credits toegevoegd! Herladen..." : isGerman ? "Credits hinzugefügt! Neu laden..." : isSpanish ? "¡Créditos añadidos! Recargando..." : "Credits added! Reloading...");
          window.setTimeout(() => { window.location.href = "/app"; }, 500);
          return;
        }

        toast(isDutch ? "Aankoop mislukt. Probeer opnieuw." : isGerman ? "Kauf fehlgeschlagen. Bitte versuche es erneut." : isSpanish ? "Compra fallida. Inténtalo de nuevo." : "Purchase failed. Please try again.");
        return;
      }

      // --- Block Stripe credits on native iOS ---
      if (isNative) {
        toast(isDutch ? "Producten konden niet geladen worden. Herstart de app." : isGerman ? "Produkte konnten nicht geladen werden. Starte die App neu." : isSpanish ? "No se pudieron cargar los productos. Reinicia la app." : "Could not load products. Please restart the app.");
        return;
      }

      // --- Stripe checkout (web) ---
      const response = await fetch("/api/stripe/credits-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        if (response.status === 403) {
          const msg = isDutch ? "Top-ups zijn alleen beschikbaar voor actieve members." : isGerman ? "Top-ups sind nur für aktive Mitglieder verfügbar." : isSpanish ? "Las recargas solo están disponibles para miembros activos." : isFrench ? "Les recharges sont réservées aux membres actifs." : "Top-ups are only available for active members.";
          setCreditsPackMessage(msg);
          toast(msg);
        } else {
          const fallback = isDutch ? "Losse credits checkout starten mislukt." : isGerman ? "Credits-Checkout konnte nicht gestartet werden." : isSpanish ? "No se pudo iniciar el checkout de créditos." : isFrench ? "Impossible de démarrer le checkout des crédits." : "Could not start credits checkout.";
          const msg = data.error ? `${data.error} (status ${response.status})` : `${fallback} (status ${response.status})`;
          setCreditsPackMessage(msg);
          toast(msg);
        }
        return;
      }
      window.location.href = data.url;
    } catch {
      const msg = isDutch ? "Losse credits checkout starten mislukt." : isGerman ? "Credits-Checkout konnte nicht gestartet werden." : isSpanish ? "No se pudo iniciar el checkout de créditos." : isFrench ? "Impossible de démarrer le checkout des crédits." : "Could not start credits checkout.";
      setCreditsPackMessage(msg);
      toast(msg);
    } finally {
      setLoadingCreditsPack(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Start checkout — branches on platform
  // ---------------------------------------------------------------------------
  const startCheckout = async (plan: Plan) => {
    try {
      setLoadingPlan(plan);

      if (isNative && rcOffering) {
        // --- RevenueCat purchase (native iOS) ---
        let pkg: RCPackage | null = null;
        if (plan === "monthly") pkg = rcOffering.monthly;
        else if (plan === "yearly") pkg = rcOffering.annual;
        else if (plan === "lifetime") pkg = rcOffering.lifetime;

        if (!pkg) {
          toast(isDutch ? "Dit plan is niet beschikbaar." : isGerman ? "Dieser Plan ist nicht verfügbar." : isSpanish ? "Este plan no está disponible." : "This plan is not available.");
          setLoadingPlan(null);
          return;
        }

        const result = await purchasePackage(pkg);

        if (result.userCancelled) {
          setLoadingPlan(null);
          return;
        }

        if (result.success) {
          // Sync entitlement to our backend
          await fetch("/api/revenuecat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rcUserId: userId }),
          });

          toast(isDutch ? "Aankoop geslaagd! Herladen..." : isGerman ? "Kauf erfolgreich! Neu laden..." : isSpanish ? "Compra exitosa! Recargando..." : "Purchase successful! Reloading...");
          window.setTimeout(() => {
            window.location.href = "/app";
          }, 500);
          return;
        }

        toast(isDutch ? "Aankoop mislukt. Probeer opnieuw." : isGerman ? "Kauf fehlgeschlagen. Bitte versuche es erneut." : isSpanish ? "Compra fallida. Inténtalo de nuevo." : "Purchase failed. Please try again.");
        setLoadingPlan(null);
        return;
      }

      // --- Block Stripe on native iOS ---
      if (isNative) {
        toast(isDutch ? "Producten konden niet geladen worden. Herstart de app." : isGerman ? "Produkte konnten nicht geladen werden. Starte die App neu." : isSpanish ? "No se pudieron cargar los productos. Reinicia la app." : "Could not load products. Please restart the app.");
        setLoadingPlan(null);
        return;
      }

      // --- Stripe checkout (web) ---
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, markerSelections }),
      });

      if (!response.ok) throw new Error("Unable to start checkout");
      const data = (await response.json()) as { url?: string };
      if (!data.url) throw new Error("Missing checkout URL");

      window.location.href = data.url;
    } catch {
      toast(isDutch ? "Checkout starten mislukt. Probeer opnieuw." : isGerman ? "Checkout konnte nicht gestartet werden. Bitte versuche es erneut." : isSpanish ? "No se pudo iniciar el checkout. Inténtalo de nuevo." : "Could not start checkout. Please try again.");
      setLoadingPlan(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Build prices object: use RC prices on native, Stripe prices on web
  // ---------------------------------------------------------------------------
  const displayPrices: Partial<Record<Plan, string | null>> = isNative
    ? {
        monthly: rcOffering?.monthly?.localizedPriceString ?? null,
        yearly: rcOffering?.annual?.localizedPriceString ?? null,
        lifetime: rcOffering?.lifetime?.localizedPriceString ?? null,
      }
    : stripePrices;

  return (
    <>
      <DisclaimerGate />
      <main className="mx-auto min-h-[100dvh] w-full max-w-hero px-5 pt-10 pb-[max(8rem,calc(env(safe-area-inset-bottom)+5rem))] md:px-10 md:py-12">
      <section className="card-premium p-6 pb-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))] md:p-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--text)]">
            <Heart className="h-4 w-4 text-[var(--accent)]" />
            {isDutch ? "Cozy kleuren voor alcohol-marker lovers" : isGerman ? "Cozy Coloring für Alkoholmarker-Liebhaber" : isSpanish ? "Coloración cozy para fans de los marcadores de alcohol" : "Cozy coloring for alcohol-marker lovers"}
          </span>

          <div className="mt-5 flex justify-center">
            <MascotBubble
              size="sm"
              imageSrc="/mascot/bubble-mascot.webp"
              messages={[
                isDutch ? "Kies je plan, ik regel de kleurmagie." : isGerman ? "Wähle deinen Plan, ich kümmere mich um die Farbmagie." : isSpanish ? "Elige tu plan y yo me encargo de la magia del color." : "Pick your plan, I'll handle the color magic.",
                isDutch ? "Ontgrendel volledige previews en snellere flow." : isGerman ? "Schalte vollständige Vorschauen und einen schnelleren Flow frei." : isSpanish ? "Desbloquea vistas previas completas y un flujo más rápido." : "Unlock full previews and faster flow.",
                isDutch ? "Kies je marker setup en ga door." : isGerman ? "Wähle dein Marker-Setup und mach weiter." : isSpanish ? "Elige tu configuración de marcadores y continúa." : "Choose your marker setup and continue.",
              ]}
            />
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-[var(--text)] md:text-6xl">{isDutch ? "Ontgrendel je cozy marker flow" : isGerman ? "Entfessle deinen cozy Marker-Flow" : isSpanish ? "Desbloquea tu flujo cozy con marcadores" : "Unlock Your Cozy Marker Flow"}</h1>
          <p className="mt-4 text-lg text-[var(--muted)] md:text-xl">
            {isDutch ? "Upload je schets en ontvang binnen seconden een warme, praktische alcohol-marker kleurreferentie." : isGerman ? "Lade deine Skizze hoch und erhalte in Sekunden eine warme, praktische Alkoholmarker-Farbreferenz." : isSpanish ? "Sube tu boceto y recibe en segundos una referencia de color cálida y práctica para marcadores de alcohol." : "Upload your sketch and get a warm, practical alcohol-marker color reference in seconds."}
          </p>

          {email ? <p className="mt-3 text-sm text-[var(--muted)]">{isDutch ? `Je bent ingelogd als ${email}` : isGerman ? `Du bist angemeldet als ${email}` : isSpanish ? `Has iniciado sesión como ${email}` : `You're signed in as ${email}`}</p> : null}
          {!alreadyUnlocked ? (
            <div className="mt-3 flex justify-center">
              <Button type="button" variant="ghost" onClick={() => void restoreAccess()} disabled={restoringAccess}>
                {restoringAccess ? (isDutch ? "Herstellen..." : isGerman ? "Wird wiederhergestellt..." : isSpanish ? "Restaurando..." : "Restoring...") : (isDutch ? "Ik heb al betaald — herstel toegang" : isGerman ? "Ich habe bereits bezahlt — Zugang wiederherstellen" : isSpanish ? "Ya pagué: restaurar acceso" : "I already paid — restore access")}
              </Button>
            </div>
          ) : null}
        </div>

        {!alreadyUnlocked ? (
          <>
            <p className="mx-auto mt-8 w-fit rounded-full border border-[var(--accent)]/25 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {isDutch ? "Kies je marker set" : isGerman ? "Wähle dein Marker-Set" : isSpanish ? "Elige tu set de marcadores" : "Pick your marker set"}
            </p>

            <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-[var(--border)] bg-white/90 p-4 text-sm">
              {markerSelections.length > 0 ? (
                <div className="space-y-1 text-[var(--text)]">
                  <p>
                    <span className="font-semibold">{isDutch ? "Marker setups:" : isGerman ? "Marker-Setups:" : isSpanish ? "Configuraciones de marcadores:" : "Marker setups:"}</span> {markerSelections.length}
                  </p>
                  {markerSelections.slice(0, 3).map((m, idx) => (
                    <p key={`${m.brand}-${m.series}-${m.setSize}-${idx}`} className="text-xs text-[var(--muted)]">
                      {m.brand} · {m.series} · {m.setSize}
                    </p>
                  ))}
                  {markerSelections.length > 3 ? (
                    <p className="text-xs text-[var(--muted)]">+{markerSelections.length - 3} {isDutch ? "meer" : isGerman ? "mehr" : isSpanish ? "más" : "more"}</p>
                  ) : null}
                </div>
              ) : (
                <p className="text-[var(--muted)]">{isDutch ? "Nog geen marker setup gevonden." : isGerman ? "Noch kein Marker-Setup gefunden." : isSpanish ? "Aún no se encontró configuración de marcadores." : "No marker setup found yet."}</p>
              )}
              <Link href="/onboarding" className="mt-2 inline-block font-semibold text-[var(--accent)] underline underline-offset-2">
                {markerSelections.length > 0 ? (isDutch ? "Wijzig marker setups" : isGerman ? "Marker-Setups ändern" : isSpanish ? "Cambiar configuraciones de marcadores" : "Change marker setups") : (isDutch ? "Rond onboarding af" : isGerman ? "Onboarding abschließen" : isSpanish ? "Completar onboarding" : "Complete onboarding")}
              </Link>
            </div>
          </>
        ) : null}

        {alreadyUnlocked ? (
          <section className="card-soft mx-auto mt-10 max-w-2xl p-6 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-[var(--accent)]" />
            <p className="mt-3 text-lg font-semibold text-[var(--text)]">{isDutch ? "Je bent helemaal klaar." : isGerman ? "Du bist startklar." : isSpanish ? "Todo está listo." : "You're all set."}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{isDutch ? "Je cozy kleurstudio staat klaar." : isGerman ? "Dein cozy Coloring-Bereich ist bereit." : isSpanish ? "Tu espacio cozy para colorear está listo." : "Your cozy coloring space is ready."}</p>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white p-4 text-left">
              <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Koop losse credits" : isGerman ? "Zusätzliche Credits kaufen" : isSpanish ? "Comprar créditos extra" : "Buy extra credits"}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {isDutch ? "Top-ups zijn beschikbaar voor actieve members." : isGerman ? "Top-ups sind für aktive Mitglieder verfügbar." : isSpanish ? "Las recargas están disponibles para miembros activos." : "Top-ups are available for active members."}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[var(--surface-2)] active:scale-[0.98] disabled:opacity-60"
                  onClick={() => void buyCredits("pack_10")}
                  disabled={loadingCreditsPack !== null}
                >
                  {loadingCreditsPack === "pack_10" ? (isDutch ? "Laden..." : isGerman ? "Lädt..." : isSpanish ? "Cargando..." : isFrench ? "Chargement..." : "Loading...") : "10 credits"}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[var(--surface-2)] active:scale-[0.98] disabled:opacity-60"
                  onClick={() => void buyCredits("pack_50")}
                  disabled={loadingCreditsPack !== null}
                >
                  {loadingCreditsPack === "pack_50" ? (isDutch ? "Laden..." : isGerman ? "Lädt..." : isSpanish ? "Cargando..." : isFrench ? "Chargement..." : "Loading...") : "50 credits"}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition-colors hover:bg-[var(--surface-2)] active:scale-[0.98] disabled:opacity-60"
                  onClick={() => void buyCredits("pack_100")}
                  disabled={loadingCreditsPack !== null}
                >
                  {loadingCreditsPack === "pack_100" ? (isDutch ? "Laden..." : isGerman ? "Lädt..." : isSpanish ? "Cargando..." : isFrench ? "Chargement..." : "Loading...") : "100 credits"}
                </button>
              </div>
              {creditsPackMessage ? (
                <p className="mt-2 text-xs text-rose-700">{creditsPackMessage}</p>
              ) : null}
            </div>

            <Button asChild className="mt-6 mb-1">
              <Link href="/app">{isDutch ? "Ga naar app" : isGerman ? "Zur App" : isSpanish ? "Ir a la app" : "Go to app"}</Link>
            </Button>
          </section>
        ) : (
          <div className="mt-12">
            {isNative && !rcReady ? (
              <p className="text-center text-sm text-[var(--muted)]">
                {isDutch ? "Producten laden..." : isGerman ? "Produkte werden geladen..." : isSpanish ? "Cargando productos..." : "Loading products..."}
              </p>
            ) : (
              <>
                <PricingGrid onContinue={startCheckout} loadingPlan={loadingPlan} disabled={isNative && !rcReady} prices={displayPrices} lang={lang} />
                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
                  <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Losse credits" : isGerman ? "Zusätzliche Credits" : isSpanish ? "Créditos extra" : "Extra credits"}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {isDutch ? "Eerst een abonnement starten. Daarna kun je top-ups bijkopen." : isGerman ? "Starte zuerst ein Abo. Danach kannst du Top-ups kaufen." : isSpanish ? "Primero inicia una suscripción. Después podrás comprar recargas." : "Start a subscription first. After that, you can buy top-ups."}
                  </p>
                </div>
              </>
            )}
            {markerSelections.length === 0 ? (
              <p className="mt-3 text-center text-sm text-[var(--muted)]">{isDutch ? "Tip: voeg je marker setup toe voor betere kleurmatches (niet verplicht voor checkout)." : isGerman ? "Tipp: Füge dein Marker-Setup für bessere Farbtreffer hinzu (nicht erforderlich für den Checkout)." : isSpanish ? "Consejo: añade tu configuración de marcadores para mejores coincidencias de color (no es obligatorio para el checkout)." : "Tip: add your marker setup for better color matching (not required for checkout)."}</p>
            ) : null}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          {isNative
            ? (isDutch ? "Beveiligde aankoop via Apple" : isGerman ? "Sicherer Kauf über Apple" : isSpanish ? "Compra segura con Apple" : "Secure purchase via Apple")
            : (isDutch ? "Veilige checkout via Stripe" : isGerman ? "Sicherer Checkout über Stripe" : isSpanish ? "Checkout seguro con Stripe" : "Secure checkout via Stripe")}
        </p>

        {!alreadyUnlocked ? (
          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            {isDutch
              ? "ColorBestie vereist een abonnement om kleurpreviews te genereren. Abonnementen worden automatisch verlengd tenzij je opzegt."
              : isGerman
                ? "ColorBestie erfordert ein Abonnement, um Farbvorschauen zu generieren. Abonnements verlängern sich automatisch, sofern du nicht kündigst."
                : isSpanish
                  ? "ColorBestie requiere una suscripción para generar previsualizaciones de color. Las suscripciones se renuevan automáticamente a menos que canceles."
                  : isFrench
                    ? "ColorBestie nécessite un abonnement pour générer des aperçus de couleurs. Les abonnements se renouvellent automatiquement sauf annulation."
                    : "ColorBestie requires a subscription to generate color previews. Subscriptions auto-renew unless cancelled."}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-[var(--muted)]">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--text)]">
            {isDutch ? "Privacybeleid" : isGerman ? "Datenschutz" : isSpanish ? "Política de privacidad" : isFrench ? "Politique de confidentialité" : "Privacy Policy"}
          </Link>
          <span>·</span>
          <Link href="/terms" className="underline underline-offset-2 hover:text-[var(--text)]">
            {isDutch ? "Voorwaarden" : isGerman ? "Nutzungsbedingungen" : isSpanish ? "Términos y condiciones" : isFrench ? "Conditions générales" : "Terms & Conditions"}
          </Link>
        </div>
      </section>
      </main>
    </>
  );
}
