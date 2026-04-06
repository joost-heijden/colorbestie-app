"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Coins, Flame, Sparkles } from "lucide-react";

import { MascotBubble } from "@/components/brand/mascot-bubble";
import { Button } from "@/components/ui/button";
import { UserBadges } from "@/components/app/user-badges";
import { GuestAccountPrompt } from "@/components/auth/guest-account-prompt";
import { useColorBestie } from "@/components/app/colorbestie-provider";
import { getLearnProgress, updateStreak } from "@/lib/learn-progress";

type Generation = { id: string; resultUrl: string | null; thumbUrl?: string | null; theme: string };
type MeResponse = { usage?: { creditsRemaining?: number; freeTrialRemaining?: number }, user?: { id?: string; entitlement?: string; subscriptionStatus?: string } };
type HomeCache = { creditsRemaining: number | null; freeTrialRemaining: number | null; recent: Generation[]; updatedAt: number };

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const HOME_CACHE_KEY = "colorbestie:home-cache:v1";
const NO_SUB_LOGIN_COUNT_KEY_PREFIX = "colorbestie:no-sub-login-count:";
const NO_SUB_SESSION_COUNTED_KEY_PREFIX = "colorbestie:no-sub-session-counted:";

function readHomeCache(): HomeCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HomeCache>;
    if (!Array.isArray(parsed.recent)) return null;
    return {
      creditsRemaining:
        typeof parsed.creditsRemaining === "number" ? parsed.creditsRemaining : parsed.creditsRemaining === null ? null : null,
      freeTrialRemaining:
        typeof parsed.freeTrialRemaining === "number" ? parsed.freeTrialRemaining : parsed.freeTrialRemaining === null ? null : null,
      recent: parsed.recent.slice(0, 3),
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function writeHomeCache(next: Partial<HomeCache>) {
  if (typeof window === "undefined") return;
  const prev = readHomeCache() ?? { creditsRemaining: null, freeTrialRemaining: null, recent: [], updatedAt: 0 };
  const merged: HomeCache = {
    creditsRemaining: next.creditsRemaining ?? prev.creditsRemaining,
    freeTrialRemaining: next.freeTrialRemaining ?? prev.freeTrialRemaining,
    recent: next.recent ?? prev.recent,
    updatedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(merged));
  } catch {
    // ignore cache write issues
  }
}

function shouldShowNoSubBanner(userId: string, hasPaidAccess: boolean) {
  if (typeof window === "undefined") return false;

  const countKey = `${NO_SUB_LOGIN_COUNT_KEY_PREFIX}${userId}`;
  const sessionKey = `${NO_SUB_SESSION_COUNTED_KEY_PREFIX}${userId}`;

  try {
    if (hasPaidAccess) {
      window.localStorage.removeItem(countKey);
      window.sessionStorage.removeItem(sessionKey);
      return false;
    }

    let currentCount = Number(window.localStorage.getItem(countKey) || "0");
    if (!Number.isFinite(currentCount) || currentCount < 0) currentCount = 0;

    const alreadyCountedThisSession = window.sessionStorage.getItem(sessionKey) === "1";
    if (!alreadyCountedThisSession) {
      currentCount += 1;
      window.localStorage.setItem(countKey, String(currentCount));
      window.sessionStorage.setItem(sessionKey, "1");
    }

    return currentCount >= 2;
  } catch {
    return false;
  }
}

export default function AppHomePage() {
  const { displayName, email, skillLevel, artInterests, resultUrl, uploadPath, uiLanguage } = useColorBestie();
  const isGuest = !email || email.endsWith("@anonymous.colorbestie.app");
  const isDutch = uiLanguage === "nl";
  const isGerman = uiLanguage === "de";
  const isSpanish = uiLanguage === "es";
  const isFrench = uiLanguage === "fr";
  const [recent, setRecent] = useState<Generation[]>(() => readHomeCache()?.recent ?? []);
  const [streakDays, setStreakDays] = useState(0);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(() => readHomeCache()?.creditsRemaining ?? null);
  const [freeTrialRemaining, setFreeTrialRemaining] = useState<number | null>(() => readHomeCache()?.freeTrialRemaining ?? null);
  const [showNoSubBanner, setShowNoSubBanner] = useState(false);

  const nextMilestone = STREAK_MILESTONES.find((m) => m > streakDays) ?? null;
  const daysUntilMilestone = nextMilestone ? Math.max(0, nextMilestone - streakDays) : 0;

  useEffect(() => {
    let cancelled = false;

    const loadRecent = async (attempt = 0) => {
      try {
        const res = await fetch("/api/generations?limit=3", { cache: "no-store" });

        if (res.status === 401 && attempt < 4) {
          window.setTimeout(() => {
            void loadRecent(attempt + 1);
          }, 250 * (attempt + 1));
          return;
        }

        const data = res.ok ? await res.json() : { generations: [] };
        if (!cancelled) {
          const nextRecent = data.generations ?? [];
          setRecent(nextRecent);
          writeHomeCache({ recent: nextRecent });
        }
      } catch {
        // keep cached recent items on transient failure
      }
    };

    void loadRecent();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCredits = async (attempt = 0) => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });

        if (res.status === 401 && attempt < 4) {
          window.setTimeout(() => {
            void loadCredits(attempt + 1);
          }, 250 * (attempt + 1));
          return;
        }

        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as MeResponse;
        if (!cancelled) {
          const credits = data.usage?.creditsRemaining;
          const trialRemaining = data.usage?.freeTrialRemaining;
          const nextCredits = typeof credits === "number" ? Math.max(0, Math.floor(credits)) : null;
          const nextTrialRemaining = typeof trialRemaining === "number" ? Math.max(0, Math.floor(trialRemaining)) : null;
          setCreditsRemaining(nextCredits);
          setFreeTrialRemaining(nextTrialRemaining);
          writeHomeCache({ creditsRemaining: nextCredits, freeTrialRemaining: nextTrialRemaining });

          const userId = data.user?.id;
          if (userId) {
            const entitlement = (data.user?.entitlement || "").toLowerCase();
            const subscriptionStatus = (data.user?.subscriptionStatus || "").toLowerCase();
            const hasPaidAccess =
              entitlement === "lifetime" ||
              subscriptionStatus === "active" ||
              subscriptionStatus === "trialing" ||
              subscriptionStatus === "past_due";
            setShowNoSubBanner(shouldShowNoSubBanner(userId, hasPaidAccess));
          } else {
            setShowNoSubBanner(false);
          }
        }
      } catch {
        // keep cached credits on transient failure
      }
    };

    void loadCredits();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncStreak = async () => {
      try {
        const progress = getLearnProgress();
        const withStreak = updateStreak(progress);
        setStreakDays(Math.max(0, withStreak.currentStreak ?? 0));

        const response = await fetch("/api/learn/streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            localCurrentStreak: withStreak.currentStreak,
            localLastVisitDate: withStreak.lastVisitDate,
          }),
        });

        if (!response.ok) return;
        const data = (await response.json()) as { currentStreak?: number };
        if (!cancelled && typeof data.currentStreak === "number") {
          setStreakDays(Math.max(0, Math.floor(data.currentStreak)));
        }
      } catch {
        if (!cancelled) setStreakDays(0);
      }
    };

    void syncStreak();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-2 md:px-8 md:pt-6">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Cozy Marker Studio</p>
        </div>
        <h1 className="mt-2 text-3xl font-black text-[var(--text)] md:text-4xl">{isDutch ? "Hey" : isGerman ? "Hey" : isSpanish ? "Hola" : isFrench ? "Salut" : "Hey"} {displayName || (isDutch ? "daar" : isGerman ? "du" : isSpanish ? "ahí" : isFrench ? "toi" : "there")}!</h1>
        <div className="flex flex-wrap items-center gap-2 overflow-hidden">
          <UserBadges skillLevel={skillLevel} artInterests={artInterests} className="mt-0 justify-start" />
          {typeof creditsRemaining === "number" ? (
            <Link
              href="/paywall"
              className="rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
            >
              <Coins className="mr-1 inline h-3 w-3" /> {creditsRemaining > 0
                ? `${creditsRemaining} ${isDutch ? "credits" : isGerman ? "Credits" : isSpanish ? "créditos" : isFrench ? "crédits" : "credits"}`
                : `${freeTrialRemaining ?? 0} ${isDutch ? (Number(freeTrialRemaining ?? 0) === 1 ? "gratis poging over" : "gratis pogingen over") : isGerman ? (Number(freeTrialRemaining ?? 0) === 1 ? "gratis Versuch übrig" : "gratis Versuche übrig") : isSpanish ? (Number(freeTrialRemaining ?? 0) === 1 ? "intento gratis restante" : "intentos gratis restantes") : isFrench ? (Number(freeTrialRemaining ?? 0) === 1 ? "essai gratuit restant" : "essais gratuits restants") : (Number(freeTrialRemaining ?? 0) === 1 ? "free try left" : "free tries left")}`}
            </Link>
          ) : null}
          {streakDays > 0 ? (
            <Link
              href="/app/learn"
              className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-weak)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text)]"
            >
              <Flame className="mr-1 inline h-3 w-3 shrink-0" /> {streakDays} {isDutch ? "dag" : isGerman ? "T." : isSpanish ? "día" : isFrench ? "j." : "day"} streak
            </Link>
          ) : null}
        </div>

        {streakDays > 0 ? (
          <div className="mt-1 space-y-0.5 text-xs text-[var(--muted)]">
            {nextMilestone ? (
              <p>
                {isDutch
                  ? `${daysUntilMilestone} ${daysUntilMilestone === 1 ? "dag" : "dagen"} tot ${nextMilestone} dagen mijlpaal`
                  : isGerman
                    ? `${daysUntilMilestone} ${daysUntilMilestone === 1 ? "Tag" : "Tage"} bis zum ${nextMilestone}-Tage-Meilenstein`
                    : isSpanish
                      ? `${daysUntilMilestone} ${daysUntilMilestone === 1 ? "día" : "días"} hasta el hito de ${nextMilestone} días`
                      : isFrench
                        ? `${daysUntilMilestone} ${daysUntilMilestone === 1 ? "jour" : "jours"} avant le palier de ${nextMilestone} jours`
                        : `${daysUntilMilestone} ${daysUntilMilestone === 1 ? "day" : "days"} until ${nextMilestone} days milestone`}
              </p>
            ) : null}
            <p>{isDutch ? "Kom morgen terug om je streak gaande te houden!" : isGerman ? "Komm morgen zurück, um deine Serie zu halten!" : isSpanish ? "¡Vuelve mañana para mantener tu racha!" : isFrench ? "Reviens demain pour garder ta série !" : "Come back tomorrow to keep your streak going!"}</p>
          </div>
        ) : null}
      </div>

      {showNoSubBanner ? (
        <div className="mb-3 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">
            {isDutch
              ? "Je abonnement is niet actief."
              : isGerman
                ? "Dein Abonnement ist nicht aktiv."
                : isSpanish
                  ? "Tu suscripción no está activa."
                  : isFrench
                    ? "Ton abonnement n'est pas actif."
                    : "Your subscription is not active."}
          </p>
          <p className="mt-0.5 text-xs text-amber-800/90">
            {isDutch
              ? "Kies een nieuw abonnement om verder te gaan met onbeperkt genereren."
              : isGerman
                ? "Wähle ein neues Abo, um mit unbegrenztem Generieren fortzufahren."
                : isSpanish
                  ? "Elige una nueva suscripción para seguir generando sin límites."
                  : isFrench
                    ? "Choisis un nouvel abonnement pour continuer à générer sans limite."
                    : "Choose a new subscription to continue generating without limits."}
          </p>
          <div className="mt-2">
            <Button asChild size="sm" className="gap-2">
              <Link href="/paywall">
                {isDutch ? "Kies abonnement" : isGerman ? "Abo wählen" : isSpanish ? "Elegir suscripción" : isFrench ? "Choisir un abonnement" : "Choose subscription"}
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <Link href="/app/upload" className="card-nav flex-1 bg-white shadow-soft">
        <div className="relative h-full min-h-[180px] md:min-h-[240px]">
          <Image src="/mascot/sit-scene-wide.webp" alt="" fill className="rounded-3xl object-cover" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h2 className="text-xl font-black text-white">{isDutch ? "Start met kleuren" : isGerman ? "Starte mit dem Kolorieren" : isSpanish ? "Empieza a colorear" : isFrench ? "Commence à colorier" : "Start New Coloring"}</h2>
            <p className="mt-1 text-sm text-white/70">{isDutch ? "Upload een schets en krijg marker inspiratie" : isGerman ? "Lade eine Skizze hoch und hol dir Marker-Inspiration" : isSpanish ? "Sube un boceto y consigue inspiración con marcadores" : isFrench ? "Importe un croquis et trouve de l'inspiration aux marqueurs" : "Upload a sketch and get marker inspiration"}</p>
            <div className="mt-4"><Button size="sm" className="gap-2">{isDutch ? "Aan de slag" : isGerman ? "Los geht's" : isSpanish ? "Vamos" : isFrench ? "C'est parti" : "Let's go"} <ArrowRight className="h-4 w-4" /></Button></div>
          </div>
        </div>
      </Link>

      {isGuest ? (
        <div className="mt-3">
          <GuestAccountPrompt lang={uiLanguage} callbackUrl="/app" variant="banner" />
        </div>
      ) : null}

      {recent.length > 0 ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{isDutch ? "Recent" : isGerman ? "Zuletzt" : isSpanish ? "Reciente" : isFrench ? "Récent" : "Recent"}</p>
          <div className="grid max-[767px]:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {recent.map((g, index) => (
              <Link key={g.id} href="/app/gallery" className={`overflow-hidden rounded-2xl bg-white ${index >= 2 ? 'hidden md:block' : ''}`}>
                <div className="relative aspect-square">{(g.thumbUrl || g.resultUrl) ? <Image src={g.thumbUrl || g.resultUrl || ""} alt="" fill className="object-cover" unoptimized /> : null}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {uploadPath && !resultUrl ? (
        <Link href="/app/upload" className="card-nav mt-3 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-weak)]"><Sparkles className="h-5 w-5 text-[var(--accent)]" /></div>
          <div className="flex-1"><p className="font-semibold">{isDutch ? "Ga verder met je flow" : isGerman ? "Mach mit deinem Flow weiter" : isSpanish ? "Sigue con tu flujo" : isFrench ? "Continue ton flow" : "Continue your flow"}</p><p className="text-xs text-[var(--muted)]">{isDutch ? "Schets geüpload - kies nu een stijl" : isGerman ? "Skizze hochgeladen – wähle als Nächstes einen Stil" : isSpanish ? "Boceto subido: ahora elige un estilo" : isFrench ? "Croquis importé — choisis maintenant un style" : "Sketch uploaded - choose a style next"}</p></div>
        </Link>
      ) : null}

      <div className="mt-3 flex justify-center">
        <MascotBubble size="sm" imageSrc="/mascot/bubble-mascot.webp" messages={[`${isDutch ? "Ga ervoor" : isGerman ? "Los geht's" : isSpanish ? "¡Vamos" : isFrench ? "Allez" : "Go for it"}, ${displayName || (isDutch ? "maker" : isGerman ? "Creator" : isSpanish ? "creador" : isFrench ? "créateur" : "creator")}!`,isDutch ? `Je cozy studio begint vorm te krijgen.` : isGerman ? `Dein cozy Studio nimmt Form an.` : isSpanish ? `Tu estudio cozy está tomando forma.` : isFrench ? `Ton studio cozy prend forme.` : `Your cozy studio is shaping up.`,isDutch ? `Laten we iets moois inkleuren.` : isGerman ? `Lass uns etwas Schönes kolorieren.` : isSpanish ? `Vamos a colorear algo bonito.` : isFrench ? `Colorions quelque chose de beau.` : `Let's color something beautiful.`]} />
      </div>
    </div>
  );
}

