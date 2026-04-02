import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";

function normalizePrice(value: string | undefined) {
  return value?.trim();
}

function formatAmount(unitAmount: number | null, currency: string) {
  if (unitAmount == null) return null;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
  }).format(unitAmount / 100);
}

export async function GET() {
  try {
    const stripe = getStripe();

    const ids = {
      monthly: normalizePrice(process.env.STRIPE_PRICE_MONTHLY),
      yearly: normalizePrice(process.env.STRIPE_PRICE_YEARLY),
      lifetime: normalizePrice(process.env.STRIPE_PRICE_LIFETIME),
    } as const;

    const entries = await Promise.all(
      Object.entries(ids).map(async ([plan, id]) => {
        if (!id) return [plan, null] as const;
        const price = await stripe.prices.retrieve(id);
        return [
          plan,
          {
            id,
            amount: formatAmount(price.unit_amount, price.currency),
          },
        ] as const;
      })
    );

    const prices = Object.fromEntries(entries);
    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json({ prices: null }, { status: 200 });
  }
}
