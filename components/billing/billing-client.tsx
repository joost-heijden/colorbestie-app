"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { DisclaimerGate } from "@/components/auth/disclaimer-gate";
import { getSupabaseBrowserClient } from "@/lib/supabase-auth-client";

import { Button } from "@/components/ui/button";
import type { BillingPlan } from "@/lib/billing";
import { fromNavigatorLanguage } from "@/lib/i18n";
import type { UiLanguage } from "@/lib/ui-language";
import { isNativeIOS, APPLE_SUBSCRIPTIONS_URL } from "@/lib/platform";

type BillingClientProps = {
  email: string;
  plan: BillingPlan;
  planLabel: string;
  subscriptionStatus: string;
  canManageBilling: boolean;
};

function statusClass(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "past_due") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "canceled") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function BillingClient({
  email,
  plan,
  planLabel,
  subscriptionStatus,
  canManageBilling,
}: BillingClientProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "yearly" | "lifetime" | null>(null);
  const [lang, setLang] = useState<UiLanguage>("en");
  const [loadingCreditsPack, setLoadingCreditsPack] = useState<"pack_10" | "pack_50" | "pack_100" | null>(null);
  const [creditsMessage, setCreditsMessage] = useState<string | null>(null);
  const [isNative, setIsNative] = useState(false);

  const isDutch = lang === "nl";
  const isGerman = lang === "de";
  const isSpanish = lang === "es";
  const isFrench = lang === "fr";

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setLang(fromNavigatorLanguage(navigator.language));
    setIsNative(isNativeIOS());
  }, []);

  const startCheckout = async (targetPlan: "monthly" | "yearly" | "lifetime") => {
    try {
      setLoadingPlan(targetPlan);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });

      if (!response.ok) {
        throw new Error("Could not start checkout");
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;
    } catch {
      toast(isDutch ? "Planwijziging starten mislukt." : isGerman ? "Planwechsel konnte nicht gestartet werden." : isSpanish ? "No se pudo iniciar el cambio de plan." : isFrench ? "Impossible de démarrer le changement de forfait." : "Could not start plan change.");
      setLoadingPlan(null);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    await signOut({ callbackUrl: "/login" });
  };

  const openPortal = async () => {
    try {
      setLoadingPortal(true);
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      if (!response.ok) {
        throw new Error("Could not open billing portal");
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("No portal URL returned");
      }

      window.location.href = data.url;
    } catch {
      toast(isDutch ? "Billing-portaal openen mislukt." : isGerman ? "Billing-Portal konnte nicht geöffnet werden." : isSpanish ? "No se pudo abrir el portal de facturación." : isFrench ? "Impossible d'ouvrir le portail de facturation." : "Could not open billing portal.");
      setLoadingPortal(false);
    }
  };

  const buyCredits = async (pack: "pack_10" | "pack_50" | "pack_100") => {
    try {
      setCreditsMessage(null);
      setLoadingCreditsPack(pack);
      const response = await fetch("/api/stripe/credits-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        const fallback = isDutch ? "Losse credits checkout starten mislukt." : isGerman ? "Credits-Checkout konnte nicht gestartet werden." : isSpanish ? "No se pudo iniciar el checkout de créditos." : isFrench ? "Impossible de démarrer le checkout des crédits." : "Could not start credits checkout.";
        const msg = data.error ? `${data.error} (status ${response.status})` : `${fallback} (status ${response.status})`;
        setCreditsMessage(msg);
        toast(msg);
        return;
      }
      window.location.href = data.url;
    } catch {
      const msg = isDutch ? "Losse credits checkout starten mislukt." : isGerman ? "Credits-Checkout konnte nicht gestartet werden." : isSpanish ? "No se pudo iniciar el checkout de créditos." : isFrench ? "Impossible de démarrer le checkout des crédits." : "Could not start credits checkout.";
      setCreditsMessage(msg);
      toast(msg);
    } finally {
      setLoadingCreditsPack(null);
    }
  };

  return (
    <>
      <DisclaimerGate />
      <main className="mx-auto w-full max-w-hero px-4 py-10 sm:px-6 md:px-10">
      <section className="card-soft mx-auto max-w-3xl p-6 sm:p-8 md:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{isDutch ? "Facturatie" : isGerman ? "Abrechnung" : isSpanish ? "Facturación" : isFrench ? "Facturation" : "Billing"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{isDutch ? `Ingelogd als ${email}` : isGerman ? `Angemeldet als ${email}` : isSpanish ? `Sesión iniciada como ${email}` : isFrench ? `Connecté en tant que ${email}` : `Signed in as ${email}`}</p>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{isDutch ? "Huidig plan" : isGerman ? "Aktueller Plan" : isSpanish ? "Plan actual" : isFrench ? "Forfait actuel" : "Current plan"}</p>
            <p className="mt-1 text-xl font-semibold text-[var(--text)]">{plan === "lifetime" ? (isDutch ? "Lifetime" : isGerman ? "Lifetime" : isSpanish ? "Vitalicio" : isFrench ? "À vie" : "Lifetime") : plan === "yearly" ? (isDutch ? "Jaarlijks" : isGerman ? "Jährlich" : isSpanish ? "Anual" : isFrench ? "Annuel" : "Yearly") : plan === "monthly" ? (isDutch ? "Maandelijks" : isGerman ? "Monatlich" : isSpanish ? "Mensual" : isFrench ? "Mensuel" : "Monthly") : (isDutch ? "Gratis" : isGerman ? "Kostenlos" : isSpanish ? "Gratis" : isFrench ? "Gratuit" : "Free")}</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{isDutch ? "Abonnementsstatus" : isGerman ? "Abo-Status" : isSpanish ? "Estado de suscripción" : isFrench ? "Statut d'abonnement" : "Subscription status"}</p>
            <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(subscriptionStatus)}`}>
              {subscriptionStatus === "active" ? (isDutch ? "actief" : isGerman ? "aktiv" : isSpanish ? "activo" : isFrench ? "actif" : "active") : subscriptionStatus === "past_due" ? (isDutch ? "achterstallig" : isGerman ? "überfällig" : isSpanish ? "atrasado" : isFrench ? "en retard" : "past due") : subscriptionStatus === "canceled" ? (isDutch ? "geannuleerd" : isGerman ? "gekündigt" : isSpanish ? "cancelado" : isFrench ? "annulé" : "canceled") : subscriptionStatus}
            </span>
          </div>
        </div>

        {/* Plan change & credits via Stripe — hidden on native iOS (use App Store subscriptions instead) */}
        {!isNative && (plan === "monthly" || plan === "yearly") ? (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{isDutch ? "Plan wijzigen" : isGerman ? "Plan ändern" : isSpanish ? "Cambiar plan" : isFrench ? "Changer de forfait" : "Change plan"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {plan !== "monthly" ? (
                <Button
                  variant="ghost"
                  onClick={() => void startCheckout("monthly")}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === "monthly" ? (isDutch ? "Maandplan openen..." : isGerman ? "Monatsplan wird geöffnet..." : isSpanish ? "Abriendo plan mensual..." : isFrench ? "Ouverture du mensuel..." : "Opening monthly...") : (isDutch ? "Naar maandelijks" : isGerman ? "Zu monatlich wechseln" : isSpanish ? "Cambiar a mensual" : isFrench ? "Passer au mensuel" : "Switch to Monthly")}
                </Button>
              ) : null}

              {plan !== "yearly" ? (
                <Button
                  variant="ghost"
                  onClick={() => void startCheckout("yearly")}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === "yearly" ? (isDutch ? "Jaarplan openen..." : isGerman ? "Jahresplan wird geöffnet..." : isSpanish ? "Abriendo plan anual..." : isFrench ? "Ouverture de l'annuel..." : "Opening yearly...") : (isDutch ? "Naar jaarlijks" : isGerman ? "Zu jährlich wechseln" : isSpanish ? "Cambiar a anual" : isFrench ? "Passer à l'annuel" : "Switch to Yearly")}
                </Button>
              ) : null}

              <Button
                variant="ghost"
                onClick={() => void startCheckout("lifetime")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "lifetime" ? (isDutch ? "Lifetime openen..." : isGerman ? "Lifetime wird geöffnet..." : isSpanish ? "Abriendo vitalicio..." : isFrench ? "Ouverture de l'accès à vie..." : "Opening lifetime...") : (isDutch ? "Upgrade naar Lifetime" : isGerman ? "Upgrade auf Lifetime" : isSpanish ? "Mejorar a vitalicio" : isFrench ? "Passer à l'accès à vie" : "Upgrade to Lifetime")}
              </Button>
            </div>
          </div>
        ) : null}

        {!isNative && (plan === "monthly" || plan === "yearly" || plan === "lifetime") ? (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{isDutch ? "Losse credits" : isGerman ? "Zusätzliche Credits" : isSpanish ? "Créditos extra" : isFrench ? "Crédits supplémentaires" : "Extra credits"}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{isDutch ? "Koop top-ups voor extra previews." : isGerman ? "Kaufe Top-ups für extra Vorschauen." : isSpanish ? "Compra recargas para vistas previas extra." : isFrench ? "Achetez des recharges pour plus d'aperçus." : "Buy top-ups for extra previews."}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition-colors hover:bg-white active:scale-[0.98] disabled:opacity-60" onClick={() => void buyCredits("pack_10")} disabled={loadingCreditsPack !== null}>
                {loadingCreditsPack === "pack_10" ? (isDutch ? "Laden..." : isGerman ? "Lädt..." : isSpanish ? "Cargando..." : isFrench ? "Chargement..." : "Loading...") : "10 credits"}
              </button>
              <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition-colors hover:bg-white active:scale-[0.98] disabled:opacity-60" onClick={() => void buyCredits("pack_50")} disabled={loadingCreditsPack !== null}>
                {loadingCreditsPack === "pack_50" ? (isDutch ? "Laden..." : isGerman ? "Lädt..." : isSpanish ? "Cargando..." : isFrench ? "Chargement..." : "Loading...") : "50 credits"}
              </button>
              <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition-colors hover:bg-white active:scale-[0.98] disabled:opacity-60" onClick={() => void buyCredits("pack_100")} disabled={loadingCreditsPack !== null}>
                {loadingCreditsPack === "pack_100" ? (isDutch ? "Laden..." : isGerman ? "Lädt..." : isSpanish ? "Cargando..." : isFrench ? "Chargement..." : "Loading...") : "100 credits"}
              </button>
            </div>
            {creditsMessage ? <p className="mt-2 text-xs text-rose-700">{creditsMessage}</p> : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
          {plan === "lifetime" ? (
            <p className="rounded-full border border-[var(--accent)]/35 bg-[var(--accent-weak)] px-4 py-2 text-sm font-medium text-[var(--text)]">
              {isDutch ? "Lifetime toegang" : isGerman ? "Lifetime-Zugang" : isSpanish ? "Acceso vitalicio" : isFrench ? "Accès à vie" : "Lifetime access"}
            </p>
          ) : null}

          {isNative ? (
            <Button
              onClick={() => {
                // Deep link to iOS Settings > Subscriptions
                window.location.href = APPLE_SUBSCRIPTIONS_URL;
              }}
            >
              {isDutch ? "Beheer abonnement (Apple)" : isGerman ? "Abo verwalten (Apple)" : isSpanish ? "Gestionar suscripción (Apple)" : isFrench ? "Gérer l'abonnement (Apple)" : "Manage subscription (Apple)"}
            </Button>
          ) : canManageBilling ? (
            <Button onClick={openPortal} disabled={loadingPortal}>
              {loadingPortal ? (isDutch ? "Stripe-portaal openen..." : isGerman ? "Stripe-Portal wird geöffnet..." : isSpanish ? "Abriendo portal de Stripe..." : isFrench ? "Ouverture du portail Stripe..." : "Opening Stripe portal...") : (isDutch ? "Open Stripe facturatieportaal" : isGerman ? "Stripe-Billing-Portal öffnen" : isSpanish ? "Abrir portal de facturación de Stripe" : isFrench ? "Ouvrir le portail de facturation Stripe" : "Open Stripe billing portal")}
            </Button>
          ) : null}

          <Button variant="ghost" asChild>
            <Link href="/app">{isDutch ? "Terug naar app" : isGerman ? "Zurück zur App" : isSpanish ? "Volver a la app" : isFrench ? "Retour à l'app" : "Back to app"}</Link>
          </Button>

          <Button variant="ghost" onClick={() => void handleSignOut()}>
            {isDutch ? "Uitloggen" : isGerman ? "Abmelden" : isSpanish ? "Cerrar sesión" : isFrench ? "Se déconnecter" : "Sign out"}
          </Button>
        </div>
      </section>
      </main>
    </>
  );
}
