import { redirect } from "next/navigation";

import { BottomNav } from "@/components/app/bottom-nav";
import { ColorBestieProvider } from "@/components/app/colorbestie-provider";
import { DisclaimerGate } from "@/components/auth/disclaimer-gate";
import { WakeLock } from "@/components/app/wake-lock";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      email: true,
      name: true,
      image: true,
      displayName: true,
      skillLevel: true,
      country: true,
    },
  });

  const user = {
    email: dbUser?.email ?? currentUser.email,
    name: dbUser?.name ?? currentUser.name,
    image: dbUser?.image ?? currentUser.image,
    skillLevel: dbUser?.skillLevel ?? null,
  };

  const onboardingName: string | null = dbUser?.displayName ?? null;
  const uiLanguage: string | null = ["nl", "en", "fr", "de", "es"].includes(dbUser?.country ?? "") ? dbUser?.country ?? null : null;

  return (
    <ColorBestieProvider
      email={user?.email ?? null}
      displayName={onboardingName ?? user?.name ?? null}
      skillLevel={user?.skillLevel ?? null}
      artInterests={[]}
      userImage={user?.image ?? null}
      uiLanguage={uiLanguage}
    >
      <DisclaimerGate />
      <WakeLock />
      <div className="mx-auto flex min-h-screen w-full max-w-hero flex-col bg-[var(--surface)] pt-[env(safe-area-inset-top)]">
        <main className="flex-1 overflow-x-hidden pb-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)]">{children}</main>
        <BottomNav />
      </div>
    </ColorBestieProvider>
  );
}
