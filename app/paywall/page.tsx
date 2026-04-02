import { PaywallClient } from "@/components/pricing/paywall-client";
import { hasPaidAccess } from "@/lib/access";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export default async function PaywallPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return <PaywallClient alreadyUnlocked={false} />;
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      email: true,
      entitlement: true,
      currentPeriodEnd: true,
    },
  });

  const alreadyUnlocked =
    !!user &&
    hasPaidAccess({
      entitlement: user.entitlement,
      currentPeriodEnd: user.currentPeriodEnd,
    });

  return <PaywallClient email={user?.email ?? undefined} alreadyUnlocked={alreadyUnlocked} userId={currentUser.id} />;
}
