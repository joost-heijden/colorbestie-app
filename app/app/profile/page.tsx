"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CreditCard, ExternalLink, Instagram, Languages, LogOut, MonitorSmartphone, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "@/lib/supabase-auth-client";
import { isNativeIOS, APPLE_SUBSCRIPTIONS_URL } from "@/lib/platform";

import { Button } from "@/components/ui/button";
import { UserBadges } from "@/components/app/user-badges";
import { useColorBestie } from "@/components/app/colorbestie-provider";
import { MARKER_SELECTION_KEY, type MarkerSelection } from "@/lib/marker-catalog";
import type { UiLanguage } from "@/lib/ui-language";

const SKILL_OPTIONS = ["beginner", "learning", "experienced", "pro"] as const;
const INSTAGRAM_SUPPORT_URL = process.env.NEXT_PUBLIC_INSTAGRAM_SUPPORT_URL || "https://ig.me/m/colorbestie.app";
const INSTAGRAM_APP_DEEPLINK = "instagram://user?username=colorbestie.app";

type CreditEvent = {
  id: string;
  kind: "grant" | "usage";
  amount: number;
  createdAt: string;
  label: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { displayName, setDisplayName, email, userImage, skillLevel, setSkillLevel, artInterests, uiLanguage, setUiLanguage } = useColorBestie();
  const [pendingName, setPendingName] = useState(displayName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [pendingSkill, setPendingSkill] = useState(skillLevel ?? "beginner");
  const [savingSkill, setSavingSkill] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState(uiLanguage);
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [creditEvents, setCreditEvents] = useState<CreditEvent[]>([]);
  const [loadingCreditEvents, setLoadingCreditEvents] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("colorbestie:keep-screen-on") === "true";
  });
  const [wakeLockRef, setWakeLockRef] = useState<WakeLockSentinel | null>(null);
  const nativeIOS = useMemo(() => isNativeIOS(), []);
  const isGuest = !email || email.endsWith("@anonymous.colorbestie.app");
  const isDutch = uiLanguage === "nl";
  const isGerman = uiLanguage === "de";
  const isSpanish = uiLanguage === "es";
  const isFrench = uiLanguage === "fr";

  const markerSelections = useMemo<MarkerSelection[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(MARKER_SELECTION_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as MarkerSelection | MarkerSelection[];
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    setPendingName(displayName ?? "");
  }, [displayName]);

  useEffect(() => {
    setPendingLanguage(uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    setPendingSkill(skillLevel ?? "beginner");
  }, [skillLevel]);

  // Wake Lock: keep screen on while in app
  useEffect(() => {
    if (!keepScreenOn) {
      if (wakeLockRef) {
        void wakeLockRef.release();
        setWakeLockRef(null);
      }
      return;
    }

    let lock: WakeLockSentinel | null = null;
    const requestLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          lock = await navigator.wakeLock.request("screen");
          setWakeLockRef(lock);
        }
      } catch {
        // Wake lock not supported or denied
      }
    };

    void requestLock();

    // Re-acquire on visibility change (iOS releases on tab switch)
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && keepScreenOn) {
        void requestLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (lock) void lock.release();
    };
  }, [keepScreenOn]);

  const toggleKeepScreenOn = () => {
    const next = !keepScreenOn;
    setKeepScreenOn(next);
    localStorage.setItem("colorbestie:keep-screen-on", String(next));
    toast(next
      ? (isDutch ? "Scherm blijft aan zolang de app open is." : isGerman ? "Bildschirm bleibt an, solange die App geöffnet ist." : isSpanish ? "La pantalla permanecerá encendida mientras la app esté abierta." : "Screen will stay on while the app is open.")
      : (isDutch ? "Scherm kan nu weer automatisch uitvallen." : isGerman ? "Bildschirm kann jetzt wieder automatisch ausgehen." : isSpanish ? "La pantalla ahora puede apagarse automáticamente." : "Screen can now turn off automatically."));
  };

  useEffect(() => {
    let cancelled = false;

    const loadCreditHistory = async () => {
      try {
        setLoadingCreditEvents(true);
        const response = await fetch("/api/credits/history", { cache: "no-store" });
        if (!response.ok) throw new Error("history_failed");
        const data = (await response.json()) as { events?: CreditEvent[] };
        if (!cancelled) setCreditEvents(data.events ?? []);
      } catch {
        if (!cancelled) setCreditEvents([]);
      } finally {
        if (!cancelled) setLoadingCreditEvents(false);
      }
    };

    void loadCreditHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatEventDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(isDutch ? "nl-NL" : isGerman ? "de-DE" : isSpanish ? "es-ES" : "en-US", {
      day: "numeric",
      month: "short",
    });

  const localizeEventLabel = (label: string) => {
    if (!isDutch && !isGerman && !isSpanish) return label;
    if (isDutch) {
      if (label === "Subscription credits") return "Abonnement credits";
      if (label === "Checkout credits") return "Checkout credits";
      if (label === "Lifetime migration credits") return "Lifetime migratiecredits";
      if (label === "Credit top-up") return "Losse credit top-up";
      if (label === "Image generation") return "Afbeelding gegenereerd";
      return label;
    }

    if (isSpanish) {
      if (label === "Subscription credits") return "Créditos de suscripción";
      if (label === "Checkout credits") return "Créditos de checkout";
      if (label === "Lifetime migration credits") return "Créditos de migración lifetime";
      if (label === "Credit top-up") return "Recarga de créditos";
      if (label === "Image generation") return "Generación de imagen";
      return label;
    }

    if (label === "Subscription credits") return "Abo-Credits";
    if (label === "Checkout credits") return "Checkout-Credits";
    if (label === "Lifetime migration credits") return "Lifetime-Migrations-Credits";
    if (label === "Credit top-up") return "Credits aufladen";
    if (label === "Image generation") return "Bildgenerierung";
    return label;
  };

  const saveName = async () => {
    const nextName = pendingName.trim();
    if (nextName.length < 2) {
      toast(isDutch ? "Vul minimaal 2 tekens in." : isGerman ? "Bitte gib mindestens 2 Zeichen ein." : isSpanish ? "Introduce al menos 2 caracteres." : "Please enter at least 2 characters.");
      return;
    }

    try {
      setSavingName(true);

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: nextName }),
      });

      if (!response.ok) throw new Error("Failed to save name");
      setDisplayName(nextName);
      toast(isDutch ? "Naam bijgewerkt." : isGerman ? "Name aktualisiert." : isSpanish ? "Nombre actualizado." : "Name updated.");
    } catch {
      toast(isDutch ? "Naam bijwerken mislukt." : isGerman ? "Name konnte nicht aktualisiert werden." : isSpanish ? "No se pudo actualizar el nombre." : "Could not update name.");
    } finally {
      setSavingName(false);
    }
  };

  const saveSkillLevel = async () => {
    if (pendingSkill === (skillLevel ?? "beginner")) {
      toast(isDutch ? "Kies eerst een ander niveau." : isGerman ? "Wähle zuerst ein anderes Level." : isSpanish ? "Elige primero otro nivel." : "Choose a different level first.");
      return;
    }

    try {
      setSavingSkill(true);

      const isDevUser = (email || "").endsWith("@colorbestie.local");
      if (isDevUser) {
        setSkillLevel(pendingSkill);
        toast(isDutch ? "Skillniveau bijgewerkt (dev-modus)." : isGerman ? "Level aktualisiert (Dev-Modus)." : isSpanish ? "Nivel actualizado (modo dev)." : "Skill level updated (dev mode).");
        return;
      }

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillLevel: pendingSkill }),
      });

      if (!response.ok) throw new Error("Failed to save skill level");
      setSkillLevel(pendingSkill);
      toast(isDutch ? "Skillniveau bijgewerkt." : isGerman ? "Level aktualisiert." : isSpanish ? "Nivel actualizado." : "Skill level updated.");
      router.refresh();
    } catch {
      toast(isDutch ? "Skillniveau bijwerken mislukt." : isGerman ? "Level konnte nicht aktualisiert werden." : isSpanish ? "No se pudo actualizar el nivel." : "Could not update skill level.");
    } finally {
      setSavingSkill(false);
    }
  };

  const saveLanguage = async () => {
    try {
      setSavingLanguage(true);

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: pendingLanguage }),
      });

      if (!response.ok) throw new Error("Failed to save language");
      const nextLanguage = pendingLanguage as UiLanguage;
      setUiLanguage(nextLanguage);
      toast(nextLanguage === "nl" ? "Taal bijgewerkt. Labels worden ververst..." : nextLanguage === "de" ? "Sprache aktualisiert. Labels werden neu geladen..." : nextLanguage === "es" ? "Idioma actualizado. Actualizando etiquetas..." : "Language updated. Refreshing labels...");
      router.refresh();
    } catch {
      toast(isDutch ? "Taal opslaan mislukt." : isGerman ? "Sprache konnte nicht aktualisiert werden." : isSpanish ? "No se pudo actualizar el idioma." : "Could not update language.");
    } finally {
      setSavingLanguage(false);
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

  const openInstagramSupport = () => {
    if (typeof window === "undefined") return;

    const startedAt = Date.now();
    window.location.href = INSTAGRAM_APP_DEEPLINK;

    window.setTimeout(() => {
      if (Date.now() - startedAt < 1600) {
        window.location.href = INSTAGRAM_SUPPORT_URL;
      }
    }, 800);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
      toast(isDutch ? "Typ DELETE om te bevestigen." : isGerman ? "Tippe DELETE zur Bestätigung." : isSpanish ? "Escribe DELETE para confirmar." : "Type DELETE to confirm.");
      return;
    }

    try {
      setDeletingAccount(true);
      const response = await fetch("/api/me/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirm }),
      });

      if (response.status === 409) {
        toast(isDutch ? "Zeg eerst je actieve abonnement op voordat je je account verwijdert." : isGerman ? "Bitte kündige zuerst dein aktives Abonnement, bevor du dein Konto löschst." : isSpanish ? "Primero cancela tu suscripción activa antes de eliminar tu cuenta." : "Please cancel your active subscription before deleting your account.");
        return;
      }

      if (!response.ok) {
        throw new Error("delete_failed");
      }

      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast(isDutch ? "Account verwijderen mislukt." : isGerman ? "Konto konnte nicht gelöscht werden." : isSpanish ? "No se pudo eliminar la cuenta." : "Could not delete account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-2 md:px-8">
      <div className="mb-3">
        <h1 className="text-2xl font-black text-[var(--text)]">{isDutch ? "Profiel" : isGerman ? "Profil" : isSpanish ? "Perfil" : isFrench ? "Profil" : "Profile"}</h1>
      </div>

      <div className="mb-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <Languages className="h-4 w-4" />
              {isDutch ? "App-taal" : isGerman ? "App-Sprache" : isSpanish ? "Idioma de la app" : "App language"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {isDutch ? "Kies direct Nederlands, Engels, Frans, Duits of Spaans voor de app." : isGerman ? "Wähle direkt Niederländisch, Englisch, Französisch, Deutsch oder Spanisch für die App." : isSpanish ? "Cambia el idioma de la app (neerlandés, inglés, francés, alemán o español)." : "Switch app language (Dutch, English, French, German, Spanish)."}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <select
            className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 text-sm"
            value={pendingLanguage}
            onChange={(e) => setPendingLanguage(e.target.value as UiLanguage)}
          >
            <option value="nl">Nederlands</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
          </select>
          <Button size="sm" onClick={() => void saveLanguage()} disabled={savingLanguage || pendingLanguage === uiLanguage}>
            {savingLanguage ? (isDutch ? "Opslaan..." : isGerman ? "Speichern..." : isSpanish ? "Guardando..." : "Saving...") : (isDutch ? "Opslaan" : isGerman ? "Speichern" : isSpanish ? "Guardar" : "Save")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--border)] bg-white p-5 shadow-soft">
        <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-2 border-[var(--accent)]/30 shadow-glow">
          <Image src={userImage || "/mascot/bubble-mascot.webp"} alt="Avatar" fill className="object-cover" unoptimized />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-[var(--text)]">{displayName || (isDutch ? "ColorBestie Maker" : isGerman ? "ColorBestie Creator" : isSpanish ? "Creador de ColorBestie" : "ColorBestie Creator")}</h2>
          <p className="text-sm text-[var(--muted)]">{email || ""}</p>
          <UserBadges skillLevel={skillLevel} artInterests={artInterests} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Jouw naam" : isGerman ? "Dein Name" : isSpanish ? "Tu nombre" : "Your name"}</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 text-sm"
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !savingName && pendingName.trim() !== (displayName ?? "").trim()) {
                e.preventDefault();
                void saveName();
              }
            }}
            placeholder={isDutch ? "Jouw naam" : isGerman ? "Dein Name" : isSpanish ? "Tu nombre" : "Your name"}
          />
          <Button size="sm" onClick={() => void saveName()} disabled={savingName || pendingName.trim() === (displayName ?? "").trim()}>
            {savingName ? (isDutch ? "Opslaan..." : isGerman ? "Speichern..." : isSpanish ? "Guardando..." : "Saving...") : (isDutch ? "Opslaan" : isGerman ? "Speichern" : isSpanish ? "Guardar" : "Save")}
          </Button>
        </div>
      </div>

      <div id="feedback-section" className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Klantenservice via Instagram" : isGerman ? "Kundensupport über Instagram" : isSpanish ? "Soporte por Instagram" : "Customer support via Instagram"}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {isDutch
            ? "Voor vragen, feedback of ontbrekende sets: stuur ons een DM op Instagram."
            : isGerman
              ? "Bei Fragen, Feedback oder fehlenden Sets: schick uns eine DM auf Instagram."
              : isSpanish
                ? "Para preguntas, feedback o sets faltantes: envíanos un DM por Instagram."
              : "For questions, feedback, or missing sets: send us an Instagram DM."}
        </p>
        <button
          type="button"
          onClick={openInstagramSupport}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] underline underline-offset-2"
        >
          <Instagram className="h-3.5 w-3.5" />
          {isDutch ? "Open Instagram DM" : isGerman ? "Instagram-DM öffnen" : isSpanish ? "Abrir DM de Instagram" : "Open Instagram DM"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Jouw niveau" : isGerman ? "Dein Level" : isSpanish ? "Tu nivel" : "Your level"}</p>
        <div className="mt-2 flex items-center gap-2">
          <select
            className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 text-sm"
            value={pendingSkill}
            onChange={(e) => setPendingSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !savingSkill && pendingSkill !== (skillLevel ?? "beginner")) {
                e.preventDefault();
                void saveSkillLevel();
              }
            }}
          >
            {SKILL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => void saveSkillLevel()} disabled={savingSkill}>
            {savingSkill ? (isDutch ? "Opslaan..." : isGerman ? "Speichern..." : isSpanish ? "Guardando..." : "Saving...") : (isDutch ? "Opslaan" : isGerman ? "Speichern" : isSpanish ? "Guardar" : "Save")}
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Marker setup" : isGerman ? "Marker-Setup" : isSpanish ? "Configuración de marcadores" : "Marker Setup"}</p>
        {markerSelections.length > 0 ? (
          <div className="mt-2 space-y-1">
            {markerSelections.slice(0, 5).map((m, idx) => (
              <p key={`${m.brand}-${idx}`} className="text-xs text-[var(--muted)]">
                {m.brand} · {m.series} · {m.setSize}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-[var(--muted)]">{isDutch ? "Nog geen marker setup opgeslagen." : isGerman ? "Noch kein Marker-Setup gespeichert." : isSpanish ? "Aún no hay una configuración de marcadores guardada." : "No marker setup saved yet."}</p>
        )}
        <Link href="/app/marker-setup" className="mt-2 inline-block text-xs font-semibold text-[var(--accent)] underline underline-offset-2">
          {isDutch ? "Bewerk marker setup" : isGerman ? "Marker-Setup bearbeiten" : isSpanish ? "Editar configuración de marcadores" : "Edit Marker Setup"}
        </Link>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Creditgeschiedenis" : isGerman ? "Credit-Verlauf" : isSpanish ? "Historial de créditos" : "Credit history"}</p>
        {loadingCreditEvents ? (
          <p className="mt-2 text-xs text-[var(--muted)]">{isDutch ? "Laden..." : isGerman ? "Wird geladen..." : isSpanish ? "Cargando..." : "Loading..."}</p>
        ) : creditEvents.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--muted)]">{isDutch ? "Nog geen creditactiviteiten." : isGerman ? "Noch keine Credit-Aktivitäten." : isSpanish ? "Aún no hay actividad de créditos." : "No credit activity yet."}</p>
        ) : (
          <div className="mt-2 space-y-1">
            {creditEvents.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-[var(--text)]">{localizeEventLabel(event.label)}</p>
                  <p className="text-[var(--muted)]">{formatEventDate(event.createdAt)}</p>
                </div>
                <span className={event.amount >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                  {event.amount >= 0 ? `+${event.amount}` : event.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="mt-4 space-y-2">
        {nativeIOS ? (
          <a
            href={APPLE_SUBSCRIPTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 transition-colors hover:bg-[var(--surface-2)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)]">
              <CreditCard className="h-5 w-5 text-[var(--text)]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--text)]">{isDutch ? "Beheer abonnement" : isGerman ? "Abonnement verwalten" : isSpanish ? "Gestionar suscripción" : "Manage Subscription"}</p>
              <p className="text-xs text-[var(--muted)]">{isDutch ? "Open je Apple abonnementsbeheer" : isGerman ? "Apple Abo-Verwaltung öffnen" : isSpanish ? "Abrir gestión de suscripción de Apple" : "Open Apple subscription management"}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-[var(--muted)]" />
          </a>
        ) : (
          <Link href="/billing" className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 transition-colors hover:bg-[var(--surface-2)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)]">
              <CreditCard className="h-5 w-5 text-[var(--text)]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--text)]">{isDutch ? "Beheer facturatie" : isGerman ? "Abrechnung verwalten" : isSpanish ? "Gestionar facturación" : "Manage Billing"}</p>
              <p className="text-xs text-[var(--muted)]">{isDutch ? "Bekijk plan, facturen en betaalmethodes" : isGerman ? "Plan, Rechnungen und Zahlungsmethoden ansehen" : isSpanish ? "Ver plan, facturas y métodos de pago" : "View plan, invoices, and payment methods"}</p>
            </div>
          </Link>
        )}

        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-weak)]">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--text)]">Version</p>
            <p className="text-xs text-[var(--muted)]">ColorBestie v1.0</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)]">
              <MonitorSmartphone className="h-5 w-5 text-[var(--text)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Scherm aan houden" : isGerman ? "Bildschirm anlassen" : isSpanish ? "Mantener pantalla encendida" : isFrench ? "Garder l'écran allumé" : "Keep screen on"}</p>
              <p className="text-xs text-[var(--muted)]">{isDutch ? "Handig als je een tekening namaakt" : isGerman ? "Praktisch beim Abzeichnen" : isSpanish ? "Útil al copiar un dibujo" : isFrench ? "Pratique pour reproduire un dessin" : "Useful when tracing a drawing"}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={keepScreenOn}
            onClick={toggleKeepScreenOn}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${keepScreenOn ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${keepScreenOn ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
        <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Juridisch" : isGerman ? "Rechtliches" : isSpanish ? "Legal" : isFrench ? "Mentions légales" : "Legal"}</p>
        <div className="mt-2 flex flex-col gap-1">
          <Link href="/privacy" className="text-xs font-semibold text-[var(--accent)] underline underline-offset-2">
            {isDutch ? "Privacybeleid" : isGerman ? "Datenschutzerklärung" : isSpanish ? "Política de privacidad" : isFrench ? "Politique de confidentialité" : "Privacy Policy"}
          </Link>
          <Link href="/terms" className="text-xs font-semibold text-[var(--accent)] underline underline-offset-2">
            {isDutch ? "Algemene voorwaarden" : isGerman ? "Nutzungsbedingungen" : isSpanish ? "Términos y condiciones" : isFrench ? "Conditions générales" : "Terms & Conditions"}
          </Link>
        </div>
      </div>

      {!isGuest ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900">{isDutch ? "Danger Zone" : isGerman ? "Gefahrenzone" : isSpanish ? "Zona de peligro" : "Danger Zone"}</p>
            <p className="mt-1 text-xs text-rose-800/80">
              {isDutch ? "Verwijder je account permanent. Dit kan niet ongedaan worden gemaakt." : isGerman ? "Lösche dein Konto dauerhaft. Dies kann nicht rückgängig gemacht werden." : isSpanish ? "Elimina tu cuenta de forma permanente. Esto no se puede deshacer." : "Delete your account permanently. This cannot be undone."}
            </p>
            <p className="mt-2 text-xs text-rose-800/80">
              {isDutch ? "Heb je nog een actief abonnement? Zeg dat eerst op voordat je je account verwijdert." : isGerman ? "Hast du noch ein aktives Abonnement? Kündige es zuerst, bevor du dein Konto löschst." : isSpanish ? "¿Aún tienes una suscripción activa? Cancélala primero antes de eliminar tu cuenta." : "Still have an active subscription? Cancel it first before deleting your account."}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE"
                className="h-10 flex-1 rounded-xl border border-rose-200 bg-white px-3 text-sm text-[var(--text)] outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => void handleDeleteAccount()}
                disabled={deletingAccount || deleteConfirm.trim().toUpperCase() !== "DELETE"}
                className="border border-rose-300 bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-800 disabled:opacity-50"
              >
                {deletingAccount ? (isDutch ? "Verwijderen..." : isGerman ? "Löschen..." : isSpanish ? "Eliminando..." : "Deleting...") : (isDutch ? "Verwijder mijn account" : isGerman ? "Mein Konto löschen" : isSpanish ? "Eliminar mi cuenta" : "Delete my account")}
              </Button>
            </div>
          </div>
        </div>
      </div> : null}

      <div className="mt-auto pt-4">
        {isGuest ? (
          <Button asChild size="lg" className="w-full gap-2">
            <Link href="/login?callbackUrl=%2Fapp">
              {isDutch ? "Log in om je data te synchroniseren" : isGerman ? "Anmelden, um deine Daten zu synchronisieren" : isSpanish ? "Inicia sesión para sincronizar tus datos" : "Sign in to sync your data across devices"}
            </Link>
          </Button>
        ) : (
          <Button size="lg" onClick={() => void handleSignOut()} className="w-full gap-2 bg-[var(--accent-bg)] text-[var(--text)] hover:bg-[var(--accent-bg-hover)]">
            <LogOut className="h-4 w-4" />
            {isDutch ? "Uitloggen" : isGerman ? "Abmelden" : isSpanish ? "Cerrar sesión" : "Sign Out"}
          </Button>
        )}
      </div>
    </div>
  );
}

