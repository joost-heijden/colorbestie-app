"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MARKER_CATALOG } from "@/lib/marker-catalog";

export function MarkerComparisonClient() {
  const [brandA, setBrandA] = useState(MARKER_CATALOG[0].brand);
  const [brandB, setBrandB] = useState(MARKER_CATALOG[1].brand);

  const dataA = MARKER_CATALOG.find((b) => b.brand === brandA)!;
  const dataB = MARKER_CATALOG.find((b) => b.brand === brandB)!;

  const totalSetsA = dataA.series.reduce((sum, s) => sum + s.sets.length, 0);
  const totalSetsB = dataB.series.reduce((sum, s) => sum + s.sets.length, 0);
  const maxSetA = Math.max(...dataA.series.flatMap((s) => s.sets.map(Number)));
  const maxSetB = Math.max(...dataB.series.flatMap((s) => s.sets.map(Number)));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[var(--text)] md:text-4xl">Marker Comparison</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Compare alcohol marker brands side-by-side. See series, sets, and available sizes.
        </p>
      </div>

      {/* Brand selectors */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Brand A</p>
          <select
            value={brandA}
            onChange={(e) => setBrandA(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold"
          >
            {MARKER_CATALOG.map((b) => (
              <option key={b.brand} value={b.brand}>
                {b.brand}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Brand B</p>
          <select
            value={brandB}
            onChange={(e) => setBrandB(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold"
          >
            {MARKER_CATALOG.map((b) => (
              <option key={b.brand} value={b.brand}>
                {b.brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison overview */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <ComparisonCard
          brand={dataA.brand}
          seriesCount={dataA.series.length}
          totalSets={totalSetsA}
          maxSet={maxSetA}
        />
        <ComparisonCard
          brand={dataB.brand}
          seriesCount={dataB.series.length}
          totalSets={totalSetsB}
          maxSet={maxSetB}
        />
      </div>

      {/* Series detail */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SeriesDetail brand={dataA.brand} series={dataA.series} />
        <SeriesDetail brand={dataB.brand} series={dataB.series} />
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-soft">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--accent)]" />
        <h2 className="mt-3 text-lg font-bold text-[var(--text)]">Use your markers with ColorBestie</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Get AI color inspiration matched to your exact marker set.
        </p>
        <Button asChild className="mt-4">
          <Link href="/onboarding">Try ColorBestie Free</Link>
        </Button>
      </div>
    </div>
  );
}

function ComparisonCard({
  brand,
  seriesCount,
  totalSets,
  maxSet,
}: {
  brand: string;
  seriesCount: number;
  totalSets: number;
  maxSet: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-soft">
      <h3 className="text-lg font-bold text-[var(--text)]">{brand}</h3>
      <div className="mt-3 space-y-1.5">
        <Stat label="Series" value={String(seriesCount)} />
        <Stat label="Available sets" value={String(totalSets)} />
        <Stat label="Largest set" value={`${maxSet} markers`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-semibold text-[var(--text)]">{value}</span>
    </div>
  );
}

function SeriesDetail({ brand, series }: { brand: string; series: { name: string; sets: string[] }[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-[var(--text)]">{brand} Series</h3>
      <div className="space-y-3">
        {series.map((s) => (
          <div key={s.name}>
            <p className="text-xs font-semibold text-[var(--text)]">{s.name}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {s.sets.map((set) => (
                <span
                  key={set}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]"
                >
                  {set} pcs
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
