import { Suspense } from "react";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentUser } from "@/lib/current-user";

type OnboardingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const currentUser = await getCurrentUser();
  const params = (await searchParams) ?? {};

  const stepParam = Array.isArray(params.step) ? params.step[0] : params.step;
  const editParam = Array.isArray(params.edit) ? params.edit[0] : params.edit;
  const signedInParam = Array.isArray(params.signedIn) ? params.signedIn[0] : params.signedIn;
  const isMarkerEditMode = editParam === "markers" || stepParam === "5";
  // After login callback: user just authenticated to complete onboarding — don't redirect to /app yet
  const isCompletingOnboarding = signedInParam === "1";

  if (currentUser?.id && !isMarkerEditMode && !isCompletingOnboarding) {
    redirect("/app");
  }

  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  );
}
