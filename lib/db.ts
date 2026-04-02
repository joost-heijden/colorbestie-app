import { prisma } from "@/lib/prisma";

type UpdateEntitlementParams = {
  userId: string;
  mappedStatus: string;
  currentPeriodEnd: Date | null;
  subscriptionId: string | null;
};

export async function findUserByStripeSubscriptionId(subscriptionId: string) {
  return prisma.user.findFirst({ where: { subscriptionId } });
}

export async function updateUserEntitlementFromSubscription(params: UpdateEntitlementParams) {
  const active = ["active", "trialing", "past_due"].includes(params.mappedStatus);
  await prisma.user.update({
    where: { id: params.userId },
    data: {
      entitlement: active ? "sub_active" : "none",
      subscriptionStatus: params.mappedStatus,
      currentPeriodEnd: params.currentPeriodEnd,
      subscriptionId: params.subscriptionId,
    },
  });
}
