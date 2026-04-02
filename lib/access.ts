type AccessInput = {
  entitlement?: string | null;
  currentPeriodEnd?: Date | string | null;
};

export function hasPaidAccess(input: AccessInput) {
  const ent = (input.entitlement || "").toLowerCase();
  if (ent === "lifetime" || ent === "paid" || ent === "pro") return true;
  if (ent === "sub_active" || ent === "subscription") {
    if (!input.currentPeriodEnd) return false;
    const end = new Date(input.currentPeriodEnd);
    return Number.isFinite(end.getTime()) && end.getTime() > Date.now();
  }
  return false;
}
