import { Button } from "@/components/ui/button";
import type { MarkerSelection } from "@/lib/marker-catalog";

type Plan = "monthly" | "yearly" | "lifetime";

export function PaywallStep({
  displayName,
  skillLevel,
  markerSelections,
  onCheckout,
  loadingPlan,
}: {
  displayName: string;
  skillLevel: string;
  markerSelections: MarkerSelection[];
  onCheckout: (plan: Plan) => Promise<void>;
  loadingPlan: Plan | null;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-6 py-8">
      <h1 className="text-3xl font-black text-[var(--text)]">Ready, {displayName || "creator"}?</h1>
      <p className="text-sm text-[var(--muted)]">Your profile is tuned for <span className="font-semibold">{skillLevel}</span> and {markerSelections.length || 1} marker setup(s).</p>
      <div className="grid gap-2">
        <Button onClick={() => void onCheckout("monthly")} disabled={loadingPlan !== null}>{loadingPlan === "monthly" ? "Loading..." : "Monthly"}</Button>
        <Button onClick={() => void onCheckout("yearly")} disabled={loadingPlan !== null}>{loadingPlan === "yearly" ? "Loading..." : "Yearly"}</Button>
        <Button onClick={() => void onCheckout("lifetime")} disabled={loadingPlan !== null}>{loadingPlan === "lifetime" ? "Loading..." : "Lifetime"}</Button>
      </div>
    </div>
  );
}
