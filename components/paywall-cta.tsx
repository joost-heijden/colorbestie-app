"use client";

import { useEffect, useState } from "react";
import { isNativeIOS } from "@/lib/platform";

type Plan = "monthly" | "yearly" | "lifetime";

const plans: Array<{ id: Plan; title: string; priceLabel: string; description: string }> = [
  { id: "monthly", title: "Monthly", priceLabel: "€12 / month", description: "Flexible monthly subscription." },
  { id: "yearly", title: "Yearly", priceLabel: "€96 / year", description: "Save compared to monthly." },
  { id: "lifetime", title: "Lifetime", priceLabel: "€249 one-time", description: "Pay once, own forever." },
];

export default function PaywallCta() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isNativeIOS());
  }, []);

  // On native iOS, Stripe checkout is not allowed — use RevenueCat/IAP instead
  if (isNative) return null;

  async function startCheckout(plan: Plan) {
    try {
      setLoadingPlan(plan);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="cards">
      {plans.map((plan) => {
        const isLoading = loadingPlan === plan.id;

        return (
          <div className="card" key={plan.id}>
            <h2>{plan.title}</h2>
            <p>{plan.priceLabel}</p>
            <p>{plan.description}</p>
            <button type="button" disabled={isLoading} onClick={() => startCheckout(plan.id)}>
              {isLoading ? "Redirecting..." : `Choose ${plan.title}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}
