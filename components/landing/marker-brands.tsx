import { MARKER_CATALOG } from "@/lib/marker-catalog";

export function MarkerBrands() {
  return (
    <section className="bg-white px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Supported brands
        </p>
        <h2 className="mt-2 text-center text-3xl font-black text-[var(--text)] md:text-4xl">
          Works with your markers
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {MARKER_CATALOG.map((brand) => (
            <div
              key={brand.brand}
              className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
            >
              <p className="text-sm font-bold text-[var(--text)]">{brand.brand}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {brand.series.length} {brand.series.length === 1 ? "series" : "series"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
