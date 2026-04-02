"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MARKER_CATALOG, MARKER_SELECTION_KEY, type MarkerSelection } from "@/lib/marker-catalog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MarkerOnboardingClient() {
  const router = useRouter();

  const [isDutch, setIsDutch] = useState(false);
  const [isGerman, setIsGerman] = useState(false);
  const [isSpanish, setIsSpanish] = useState(false);
  const [isFrench, setIsFrench] = useState(false);
  const [brand, setBrand] = useState(MARKER_CATALOG[0].brand);
  const selectedBrand = useMemo(
    () => MARKER_CATALOG.find((b) => b.brand === brand) ?? MARKER_CATALOG[0],
    [brand]
  );

  const [series, setSeries] = useState(selectedBrand.series[0].name);
  const selectedSeries = useMemo(
    () => selectedBrand.series.find((s) => s.name === series) ?? selectedBrand.series[0],
    [selectedBrand, series]
  );

  const [setSize, setSetSize] = useState(selectedSeries.sets[0]);
  const [extraColorsInput, setExtraColorsInput] = useState("");
  const [selections, setSelections] = useState<MarkerSelection[]>([]);

  useEffect(() => {
    const language = (navigator.language || "").toLowerCase();
    setIsDutch(language.startsWith("nl"));
    setIsGerman(language.startsWith("de"));
    setIsSpanish(language.startsWith("es"));
    setIsFrench(language.startsWith("fr"));
  }, []);

  const onBrandChange = (nextBrand: string) => {
    const b = MARKER_CATALOG.find((x) => x.brand === nextBrand) ?? MARKER_CATALOG[0];
    const nextSeries = b.series[0];
    setBrand(b.brand);
    setSeries(nextSeries.name);
    setSetSize(nextSeries.sets[0]);
  };

  const onSeriesChange = (nextSeriesName: string) => {
    const s = selectedBrand.series.find((x) => x.name === nextSeriesName) ?? selectedBrand.series[0];
    setSeries(s.name);
    setSetSize(s.sets[0]);
  };

  const addSelection = () => {
    const extraColors = extraColorsInput
      .split(/[\s,]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 3);

    const next: MarkerSelection = { brand, series, setSize, ...(extraColors.length ? { extraColors } : {}) };

    setSelections((prev) => {
      const exists = prev.some(
        (item) =>
          item.brand === next.brand &&
          item.series === next.series &&
          item.setSize === next.setSize &&
          JSON.stringify(item.extraColors ?? []) === JSON.stringify(next.extraColors ?? [])
      );

      if (exists) {
        toast(isDutch ? "Deze marker set is al toegevoegd." : isGerman ? "Dieses Marker-Set wurde bereits hinzugefügt." : isSpanish ? "Este set de marcadores ya está añadido." : "This marker set is already added.");
        return prev;
      }

      toast(isDutch ? "Marker set toegevoegd." : isGerman ? "Marker-Set hinzugefügt." : isSpanish ? "Set de marcadores añadido." : "Marker set added.");
      return [...prev, next];
    });

    setExtraColorsInput("");
  };

  const removeSelection = (index: number) => {
    setSelections((prev) => prev.filter((_, i) => i !== index));
  };

  const canContinue = selections.length > 0;

  const continueToPaywall = () => {
    if (!canContinue) return;
    localStorage.setItem(MARKER_SELECTION_KEY, JSON.stringify(selections));
    router.push("/paywall");
  };

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl bg-[var(--accent-weak)] px-5 py-10 md:px-8">
      <section className="rounded-[1.8rem] border border-[var(--border)] bg-white p-6 shadow-soft md:p-8">
        <h1 className="text-3xl font-black text-[var(--text)] md:text-4xl">{isDutch ? "Stel eerst je markers in" : isGerman ? "Richte zuerst deine Marker ein" : isSpanish ? "Configura primero tus marcadores" : "Set up your markers first"}</h1>
        <p className="mt-2 text-[var(--muted)]">{isDutch ? "Voeg één of meer marker sets toe die je al hebt voordat je afrekent." : isGerman ? "Füge vor dem Checkout ein oder mehrere Marker-Sets hinzu, die du bereits besitzt." : isSpanish ? "Añade uno o más sets de marcadores que ya tengas antes de pagar." : "Add one or more marker sets you already own before checkout."}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-[var(--text)]">{isDutch ? "Merk" : isGerman ? "Marke" : isSpanish ? "Marca" : "Brand"}</span>
            <select className="h-11 rounded-xl border border-[var(--border)] bg-white px-3" value={brand} onChange={(e) => onBrandChange(e.target.value)}>
              {MARKER_CATALOG.map((b) => (
                <option key={b.brand} value={b.brand}>{b.brand}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-[var(--text)]">{isDutch ? "Lijn" : isGerman ? "Serie" : isSpanish ? "Serie" : "Series"}</span>
            <select className="h-11 rounded-xl border border-[var(--border)] bg-white px-3" value={series} onChange={(e) => onSeriesChange(e.target.value)}>
              {selectedBrand.series.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-[var(--text)]">{isDutch ? "Setgrootte" : isGerman ? "Setgröße" : isSpanish ? "Tamaño del set" : "Set size"}</span>
            <select className="h-11 rounded-xl border border-[var(--border)] bg-white px-3" value={setSize} onChange={(e) => setSetSize(e.target.value)}>
              {selectedSeries.sets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 grid gap-1.5 text-sm">
          <span className="font-semibold text-[var(--text)]">{isDutch ? "Voeg max 3 ontbrekende kleuren toe" : isGerman ? "Füge bis zu 3 fehlende Farben hinzu" : isSpanish ? "Añade hasta 3 colores que te faltan" : "Add up to 3 missing colors"}</span>
          <input
            className="h-11 rounded-xl border border-[var(--border)] bg-white px-3"
            placeholder={isDutch ? "bijv. YR1, E11, R20" : isGerman ? "z. B. YR1, E11, R20" : isSpanish ? "p. ej. YR1, E11, R20" : "e.g. YR1, E11, R20"}
            value={extraColorsInput}
            onChange={(e) => setExtraColorsInput(e.target.value)}
          />
        </label>

        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={addSelection}>{isDutch ? "Marker set toevoegen" : isGerman ? "Marker-Set hinzufügen" : isSpanish ? "Añadir set de marcadores" : "Add marker set"}</Button>
        </div>

        <div className="mt-5 space-y-2">
          {selections.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{isDutch ? "Nog geen marker sets toegevoegd." : isGerman ? "Noch keine Marker-Sets hinzugefügt." : isSpanish ? "Aún no hay sets de marcadores añadidos." : "No marker sets added yet."}</p>
          ) : (
            selections.map((item, idx) => (
              <div key={`${item.brand}-${item.series}-${item.setSize}-${idx}`} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm">
                <span>{item.brand} · {item.series} · {item.setSize}{item.extraColors?.length ? ` · extra: ${item.extraColors.join("/")}` : ""}</span>
                <button type="button" onClick={() => removeSelection(idx)} className="text-[var(--muted)] underline underline-offset-2">{isDutch ? "Verwijderen" : isGerman ? "Entfernen" : isSpanish ? "Quitar" : "Remove"}</button>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={continueToPaywall} size="lg" disabled={!canContinue}>{isDutch ? "Ga verder naar plannen" : isGerman ? "Weiter zu den Plänen" : isSpanish ? "Continuar a los planes" : "Continue to plans"}</Button>
        </div>
      </section>
    </main>
  );
}
