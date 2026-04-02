import { useMemo, useState } from "react";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MARKER_CATALOG, type MarkerSelection } from "@/lib/marker-catalog";

const INSTAGRAM_SUPPORT_URL = process.env.NEXT_PUBLIC_INSTAGRAM_SUPPORT_URL || "https://ig.me/m/colorbestie.app";
const INSTAGRAM_APP_DEEPLINK = "instagram://user?username=colorbestie.app";

export function MarkerStep({ language, selections, setSelections }: { language: string; selections: MarkerSelection[]; setSelections: (v: MarkerSelection[]) => void; }) {
  const isDutch = language === "nl";
  const isGerman = language === "de";
  const isSpanish = language === "es";
  const isFrench = language === "fr";
  const [brand, setBrand] = useState(MARKER_CATALOG[0].brand);
  const selectedBrand = useMemo(() => MARKER_CATALOG.find((b) => b.brand === brand) ?? MARKER_CATALOG[0], [brand]);
  const [series, setSeries] = useState(selectedBrand.series[0].name);
  const selectedSeries = useMemo(() => selectedBrand.series.find((s) => s.name === series) ?? selectedBrand.series[0], [selectedBrand, series]);
  const [setSize, setSetSize] = useState(selectedSeries.sets[0]);
  const [extraColorsInput, setExtraColorsInput] = useState("");

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
    const exists = selections.some(
      (item) =>
        item.brand === next.brand &&
        item.series === next.series &&
        item.setSize === next.setSize &&
        JSON.stringify(item.extraColors ?? []) === JSON.stringify(next.extraColors ?? [])
    );
    if (exists) return;
    setSelections([...selections, next]);
    setExtraColorsInput("");
  };

  const removeSelection = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const openInstagramSupport = () => {
    if (typeof window === "undefined") return;

    const startedAt = Date.now();
    window.location.href = INSTAGRAM_APP_DEEPLINK;

    window.setTimeout(() => {
      if (Date.now() - startedAt < 1600) {
        window.location.href = INSTAGRAM_SUPPORT_URL;
      }
    }, 800);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[var(--border)] bg-white p-3 md:p-6">
        <h1 className="text-[2rem] font-black leading-[0.95] text-[var(--text)] md:text-5xl">{isDutch ? "Jouw stifteninventaris" : isGerman ? "Dein Marker-Inventar" : isSpanish ? "Tu inventario de marcadores" : isFrench ? "Ton inventaire de marqueurs" : "Your marker inventory"}</h1>
        <p className="mt-1.5 text-sm leading-snug text-[var(--muted)] md:mt-3 md:text-2xl">{isDutch ? "Voeg je echte set toe voor nog nauwkeurigere kleuradviezen — of ga gewoon verder als je dit later wilt doen." : isGerman ? "Füge dein echtes Set für noch genauere Farbempfehlungen hinzu — oder mach einfach weiter, wenn du das später tun möchtest." : isSpanish ? "Añade tu set real para obtener sugerencias de color más precisas, o sigue adelante si prefieres hacerlo más tarde." : isFrench ? "Ajoute ton vrai set pour obtenir des conseils couleur encore plus précis — ou continue simplement si tu préfères le faire plus tard." : "Add your real set for more accurate color suggestions — or simply continue if you'd rather do this later."}</p>
        <div className="mt-3">
          <div className="grid gap-2">
            <label className="grid gap-1 text-sm md:text-xl"><span className="font-semibold">{isDutch ? "Merk" : isGerman ? "Marke" : isSpanish ? "Marca" : isFrench ? "Marque" : "Brand"}</span><select value={brand} onChange={(e) => onBrandChange(e.target.value)} className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm md:h-12 md:text-xl">{MARKER_CATALOG.map((b) => <option key={b.brand} value={b.brand}>{b.brand}</option>)}</select></label>
            <label className="grid gap-1 text-sm md:text-xl"><span className="font-semibold">{isDutch ? "Lijn" : isGerman ? "Serie" : isSpanish ? "Serie" : isFrench ? "Série" : "Series"}</span><select value={series} onChange={(e) => onSeriesChange(e.target.value)} className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm md:h-12 md:text-xl">{selectedBrand.series.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}</select></label>
            <label className="grid gap-1 text-sm md:text-xl"><span className="font-semibold">{isDutch ? "Setgrootte" : isGerman ? "Setgröße" : isSpanish ? "Tamaño del set" : isFrench ? "Taille du set" : "Set size"}</span><select value={setSize} onChange={(e) => setSetSize(e.target.value)} className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm md:h-12 md:text-xl">{selectedSeries.sets.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
            <label className="grid gap-1 text-sm md:text-xl">
              <span className="font-semibold">{isDutch ? "Voeg max 3 ontbrekende kleuren toe" : isGerman ? "Füge bis zu 3 fehlende Farben hinzu" : isSpanish ? "Añade hasta 3 colores que te faltan" : isFrench ? "Ajoute jusqu'à 3 couleurs manquantes" : "Add up to 3 missing colors"}</span>
              <input
                value={extraColorsInput}
                onChange={(e) => setExtraColorsInput(e.target.value)}
                placeholder={isDutch ? "bijv. YR1, E11, R20" : isGerman ? "z. B. YR1, E11, R20" : isSpanish ? "p. ej. YR1, E11, R20" : isFrench ? "ex. YR1, E11, R20" : "e.g. YR1, E11, R20"}
                className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm md:h-12 md:text-xl"
              />
            </label>
          </div>
          <div className="mt-2"><Button type="button" variant="ghost" className="h-9 border border-[var(--border)] bg-white px-3 text-sm md:h-12 md:px-5 md:text-xl" onClick={addSelection}>{isDutch ? "Stiftenset toevoegen" : isGerman ? "Marker-Set hinzufügen" : isSpanish ? "Añadir set de marcadores" : isFrench ? "Ajouter un set de marqueurs" : "Add marker set"}</Button></div>
        </div>

        <div className="mt-3 space-y-2">
          {selections.length === 0 ? (
            <>
              <p className="text-sm text-[var(--muted)] md:text-lg">{isDutch ? "Nog geen stiftensets toegevoegd." : isGerman ? "Noch keine Marker-Sets hinzugefügt." : isSpanish ? "Aún no has añadido sets de marcadores." : isFrench ? "Aucun set de marqueurs ajouté pour l'instant." : "No marker sets added yet."}</p>
              <p className="text-xs text-[var(--muted)] md:text-base">{isDutch ? "Geen set toevoegen? Geen probleem — je kunt later altijd je markers instellen." : isGerman ? "Kein Set hinzufügen? Kein Problem — du kannst deine Marker später jederzeit einstellen." : isSpanish ? "¿No quieres añadir un set? No pasa nada: siempre puedes configurar tus marcadores más tarde." : isFrench ? "Tu ne veux pas ajouter de set ? Aucun souci — tu pourras toujours configurer tes marqueurs plus tard." : "No set yet? No problem — you can always add your markers later."}</p>
            </>
          ) : (
            <div className="space-y-2">
              {selections.map((item, idx) => (
                <div key={`${item.brand}-${item.series}-${item.setSize}-${idx}`} className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-1.5 text-xs md:text-lg">
                  <span className="min-w-0 truncate">{item.brand} · {item.series} · {item.setSize}{item.extraColors?.length ? ` · extra: ${item.extraColors.join("/")}` : ""}</span>
                  <button type="button" onClick={() => removeSelection(idx)} className="shrink-0 text-[var(--muted)] underline underline-offset-2">{isDutch ? "Verwijderen" : isGerman ? "Entfernen" : isSpanish ? "Quitar" : isFrench ? "Supprimer" : "Remove"}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Set niet gevonden?" : isGerman ? "Set nicht gefunden?" : isSpanish ? "¿No encuentras tu set?" : isFrench ? "Tu ne trouves pas ton set ?" : "Missing a marker set?"}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {isDutch
              ? "Stuur een Instagram DM met merk, lijn en setgrootte. Dan voegen we hem toe."
              : isGerman
                ? "Schick uns eine Instagram-DM mit Marke, Serie und Setgröße. Dann fügen wir es hinzu."
                : isSpanish
                  ? "Envíanos un DM por Instagram con marca, línea y tamaño del set. Lo añadimos."
                  : isFrench
                    ? "Envoie-nous un DM Instagram avec la marque, la gamme et la taille du set. Nous l'ajouterons."
                    : "Send an Instagram DM with brand, line and set size. We'll add it."}
          </p>
          <button
            type="button"
            onClick={openInstagramSupport}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] underline underline-offset-2"
          >
            <Instagram className="h-3.5 w-3.5" />
            {isDutch ? "Open Instagram DM" : isGerman ? "Instagram-DM öffnen" : isSpanish ? "Abrir DM de Instagram" : isFrench ? "Ouvrir le DM Instagram" : "Open Instagram DM"}
          </button>
        </div>
      </div>
    </div>
  );
}
