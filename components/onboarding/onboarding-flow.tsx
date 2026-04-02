"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StepLayout } from "@/components/onboarding/step-layout";
import { WelcomeStep } from "@/components/onboarding/steps/welcome-step";
import { CountryStep } from "@/components/onboarding/steps/country-step";
import { GoalsStep } from "@/components/onboarding/steps/goals-step";
import { SkillStep } from "@/components/onboarding/steps/skill-step";
import { MarkerStep } from "@/components/onboarding/steps/marker-step";
import { NotificationsStep } from "@/components/onboarding/steps/notifications-step";
import { BuildingStep } from "@/components/onboarding/steps/building-step";
// paywall handled after onboarding completion
import { MARKER_SELECTION_KEY, type MarkerSelection } from "@/lib/marker-catalog";
type SkillLevel = "beginner" | "learning" | "experienced" | "pro";

type OnboardingData = {
  displayName: string;
  country: string;
  uiLanguage: string;
  goals: string[];
  skillLevel: SkillLevel;
  markerSelections: MarkerSelection[];
};

const TOTAL_STEPS = 7;
const ONBOARDING_NAME_KEY = "colorbestie-onboarding-name";
const ONBOARDING_SKILL_KEY = "colorbestie-onboarding-skill";

export function OnboardingFlow() {
  const router = useRouter();
  const search = useSearchParams();

  const [step, setStep] = useState(1);
  const didInitStepFromQuery = useRef(false);
  const didHydrateMarkers = useRef(false);
  const isMarkerEditMode = search.get("edit") === "markers";
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    country: "nl",
    uiLanguage: "en",
    goals: [],
    skillLevel: "beginner",
    markerSelections: [],
  });

  const saveOnboarding = useCallback(async (markerSelectionsOverride?: MarkerSelection[]) => {
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          country: data.country,
          skillLevel: data.skillLevel,
          markerSelections: markerSelectionsOverride ?? data.markerSelections,
        }),
      });
    } catch {
      // best effort
    }
  }, [data.displayName, data.country, data.skillLevel, data.markerSelections]);

  useEffect(() => {
    if (!didInitStepFromQuery.current) {
      const stepQuery = Number(search.get("step") || "");
      if (Number.isFinite(stepQuery) && stepQuery >= 1 && stepQuery <= TOTAL_STEPS) {
        setStep(stepQuery);
      }
      didInitStepFromQuery.current = true;
    }

    if (!didHydrateMarkers.current) {
      try {
        const shouldHydrateMarkers = isMarkerEditMode || search.get("signedIn") === "1";
        if (shouldHydrateMarkers) {
          const raw = localStorage.getItem(MARKER_SELECTION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as MarkerSelection[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setData((prev) => ({ ...prev, markerSelections: parsed }));
            }
          }
        }
      } catch {
        // ignore malformed localStorage
      }
      didHydrateMarkers.current = true;
    }

    if (search.get("signedIn") === "1") {
      void (async () => {
        let persistedSelections = data.markerSelections;

        if (persistedSelections.length === 0) {
          try {
            const raw = localStorage.getItem(MARKER_SELECTION_KEY);
            const parsed = raw ? (JSON.parse(raw) as MarkerSelection[]) : [];
            if (Array.isArray(parsed) && parsed.length > 0) {
              persistedSelections = parsed;
              setData((prev) => ({ ...prev, markerSelections: parsed }));
            }
          } catch {
            // ignore malformed localStorage
          }
        } else {
          localStorage.setItem(MARKER_SELECTION_KEY, JSON.stringify(persistedSelections));
        }

        await saveOnboarding(persistedSelections);
        router.refresh();
        setStep(6);
        router.replace("/onboarding");
      })();
    }
  }, [router, saveOnboarding, search, data.markerSelections]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = ["nl", "en", "fr", "de", "es"].includes(data.uiLanguage) ? data.uiLanguage : "en";
  }, [data.uiLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_NAME_KEY, data.displayName || "");
      localStorage.setItem(ONBOARDING_SKILL_KEY, data.skillLevel || "beginner");
    } catch {
      // ignore
    }
  }, [data.displayName, data.skillLevel]);

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const ctaDisabled = useMemo(() => {
    if (step === 1) return data.displayName.trim().length < 2;
    if (step === 2) return !data.country;
    if (step === 3) return data.goals.length === 0;
    if (step === 7) return true;
    return false;
  }, [step, data.displayName, data.country, data.goals.length, data.markerSelections.length]);

  // checkout starts on /paywall after onboarding

  if (step === 7) {
    return <BuildingStep language={data.uiLanguage} onDone={() => router.push("/paywall")} />;
  }

  const handleStepNext = () => {
    if (step === 5) {
      localStorage.setItem(MARKER_SELECTION_KEY, JSON.stringify(data.markerSelections));

      if (isMarkerEditMode) {
        void saveOnboarding(data.markerSelections).finally(() => {
          router.refresh();
          router.push("/app/profile");
        });
        return;
      }

      router.push("/login?callbackUrl=%2Fonboarding%3FsignedIn%3D1");
      return;
    }

    next();
  };

  const handleStepBack = () => {
    back();
  };

  const showBottomNav = step !== 6;

  const stepLabel = data.uiLanguage === "nl" ? "Stap" : data.uiLanguage === "fr" ? "Étape" : data.uiLanguage === "de" ? "Schritt" : data.uiLanguage === "es" ? "Paso" : "Step";
  const backLabel = data.uiLanguage === "nl" ? "Terug" : data.uiLanguage === "fr" ? "Retour" : data.uiLanguage === "de" ? "Zurück" : data.uiLanguage === "es" ? "Atrás" : "Back";
  const ctaLabel = data.uiLanguage === "nl" ? "Doorgaan" : data.uiLanguage === "fr" ? "Continuer" : data.uiLanguage === "de" ? "Weiter" : data.uiLanguage === "es" ? "Continuar" : "Continue";

  return (
    <StepLayout
      step={step}
      total={TOTAL_STEPS}
      onBack={showBottomNav && step > 1 ? handleStepBack : undefined}
      stepLabel={stepLabel}
      backLabel={backLabel}
      ctaLabel={ctaLabel}
      onNext={showBottomNav && step !== 7 ? handleStepNext : undefined}
      ctaDisabled={ctaDisabled}
    >
      {step === 1 ? <WelcomeStep language={data.uiLanguage} displayName={data.displayName} setDisplayName={(v) => setData((p) => ({ ...p, displayName: v }))} /> : null}
      {step === 2 ? <CountryStep country={data.uiLanguage} setCountry={(v) => setData((p) => ({ ...p, country: v, uiLanguage: v }))} /> : null}
      {step === 3 ? <GoalsStep language={data.uiLanguage} selected={data.goals} setSelected={(v) => setData((p) => ({ ...p, goals: v }))} /> : null}
      {step === 4 ? <SkillStep language={data.uiLanguage} value={data.skillLevel} onChange={(v) => setData((p) => ({ ...p, skillLevel: v }))} /> : null}
      {step === 5 ? <MarkerStep language={data.uiLanguage} selections={data.markerSelections} setSelections={(v) => setData((p) => ({ ...p, markerSelections: v }))} /> : null}
      {step === 6 ? <NotificationsStep language={data.uiLanguage} onEnable={() => setStep(7)} onSkip={() => setStep(7)} /> : null}
    </StepLayout>
  );
}
