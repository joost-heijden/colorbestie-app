"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";

const MascotBubble = dynamic(() => import("@/components/brand/mascot-bubble").then((m) => m.MascotBubble), {
  ssr: false,
});
import { Button } from "@/components/ui/button";
import { TagPillSelector } from "@/components/app/tag-pill-selector";
import { useColorBestie } from "@/components/app/colorbestie-provider";
import {
  DEFAULT_MULTI_THEME_TAG_SELECTION,
  THEME_TAGS,
  getGenreOptions,
  type MultiThemeTagSelection,
  type ThemeCategory,
  type ThemeTagSelection,
  toThemePromptMulti,
} from "@/lib/theme-tags";

export default function UploadPage() {
  const router = useRouter();
  const {
    displayName,
    uploadPath,
    uploadPreviewUrl,
    isUploading,
    isGenerating,
    isOffline,
    fileName,
    uploadFile,
    setSelectedTheme,
    specialWishes,
    setSpecialWishes,
    runGenerate,
    uiLanguage,
  } = useColorBestie();
  const isDutch = uiLanguage === "nl";
  const isGerman = uiLanguage === "de";
  const isSpanish = uiLanguage === "es";
  const isFrench = uiLanguage === "fr";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [tagSelection, setTagSelection] = useState<MultiThemeTagSelection>(DEFAULT_MULTI_THEME_TAG_SELECTION);
  const [skinTone, setSkinTone] = useState("");
  const [fantasySkin, setFantasySkin] = useState("");

  const genreOptions = useMemo(
    () =>
      getGenreOptions({
        ColorPalette: (tagSelection.ColorPalette[0] ?? "Pastel") as ThemeTagSelection["ColorPalette"],
        Mood: (tagSelection.Mood[0] ?? "Cozy") as ThemeTagSelection["Mood"],
        StyleInfluence: (tagSelection.StyleInfluence[0] ?? "Modern") as ThemeTagSelection["StyleInfluence"],
        Lighting: (tagSelection.Lighting[0] ?? "Day") as ThemeTagSelection["Lighting"],
      }),
    [tagSelection.ColorPalette, tagSelection.Mood, tagSelection.StyleInfluence, tagSelection.Lighting]
  );

  useEffect(() => {
    const sanitizedGenre = tagSelection.Genre.filter((g) => genreOptions.includes(g as ThemeTagSelection["Genre"]));
    if (sanitizedGenre.length !== tagSelection.Genre.length) {
      setTagSelection((prev) => ({ ...prev, Genre: sanitizedGenre }));
      return;
    }

    const extras = [
      skinTone.trim() ? `Skin tone: ${skinTone.trim()}` : null,
      fantasySkin.trim() ? `Fantasy skin: ${fantasySkin.trim()}` : null,
    ].filter(Boolean);

    const prompt = [toThemePromptMulti(tagSelection), ...extras].filter(Boolean).join(" · ");
    setSelectedTheme(prompt);
  }, [genreOptions, tagSelection, skinTone, fantasySkin, setSelectedTheme]);

  useEffect(() => {
    router.prefetch("/app/preview");
    router.prefetch("/app/gallery");
  }, [router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset value so selecting the same file again still triggers onChange reliably on mobile.
    event.currentTarget.value = "";
    if (file) void uploadFile(file);
  };

  const MAX_PER_CATEGORY: Record<ThemeCategory, number> = {
    ColorPalette: 6,
    Mood: 6,
    StyleInfluence: 4,
    Lighting: 4,
    Genre: 8,
    SpecialEffects: 3,
    KeepMyDrawing: 1,
  };

  const toggleTag = (category: ThemeCategory, value: string) => {
    setTagSelection((prev) => {
      const current = prev[category] as string[];
      const exists = current.includes(value);
      if (exists) {
        const next = current.filter((v) => v !== value);
        return { ...prev, [category]: next } as MultiThemeTagSelection;
      }
      if (current.length >= MAX_PER_CATEGORY[category]) return prev;
      return { ...prev, [category]: [...current, value] } as MultiThemeTagSelection;
    });
  };

  const clearCategory = (category: ThemeCategory) => {
    setTagSelection((prev) => ({ ...prev, [category]: [] } as MultiThemeTagSelection));
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-5 pt-4 pb-2 md:px-8">
      <div className="mb-4 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{isDutch ? "Stap 1" : isGerman ? "Schritt 1" : isSpanish ? "Paso 1" : isFrench ? "Étape 1" : "Step 1"}</p>
        <h1 className="mt-1 text-2xl font-black text-[var(--text)]">{isDutch ? "Upload je schets" : isGerman ? "Lade deine Skizze hoch" : isSpanish ? "Sube tu boceto" : isFrench ? "Télécharge ton croquis" : "Upload Your Sketch"}</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center">
        {!uploadPath && !isUploading ? (
          <div className="w-full max-w-sm space-y-3 md:max-w-md">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isOffline}
              className="card-nav rounded-3xl flex w-full flex-col items-center gap-4 border-2 border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-weak)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-weak)]">
                <ImagePlus className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">{isDutch ? "Kies uit galerij" : isGerman ? "Aus Galerie wählen" : isSpanish ? "Elegir de la galería" : isFrench ? "Choisir depuis la galerie" : "Choose from gallery"}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{isDutch ? "PNG of JPG, max 10MB" : isGerman ? "PNG oder JPG, max. 10 MB" : isSpanish ? "PNG o JPG, máx. 10 MB" : isFrench ? "PNG ou JPG, max 10 Mo" : "PNG or JPG, max 10MB"}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isOffline}
              className="card-nav rounded-3xl flex w-full items-center justify-center gap-2 border border-[var(--border)] bg-white p-4 text-sm font-semibold text-[var(--text)]"
            >
              {isDutch ? "Maak een foto" : isGerman ? "Foto aufnehmen" : isSpanish ? "Tomar una foto" : isFrench ? "Prendre une photo" : "Take a photo"}
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-[var(--border)] bg-white p-8 text-center shadow-soft md:max-w-md">
            <div className="h-16 w-16 animate-pulse rounded-full bg-[var(--accent-weak)]" />
            <div>
              <p className="font-semibold text-[var(--text)]">{isDutch ? "Uploaden..." : isGerman ? "Wird hochgeladen..." : isSpanish ? "Subiendo..." : isFrench ? "Téléchargement..." : "Uploading..."}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{fileName}</p>
            </div>
          </div>
        ) : (
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-soft md:max-w-md">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
              {uploadPreviewUrl ? (
                <img src={uploadPreviewUrl} alt="Uploaded sketch preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[var(--surface-2)]">
                  <Upload className="h-6 w-6 text-[var(--muted)]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-[var(--text)]">{isDutch ? "Schets klaar!" : isGerman ? "Skizze bereit!" : isSpanish ? "¡Boceto listo!" : isFrench ? "Croquis prêt !" : "Sketch ready!"}</p>
              <p className="truncate text-xs text-[var(--muted)]">{fileName}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-medium text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
              >
                {isDutch ? "Wijzig schets" : isGerman ? "Skizze ändern" : isSpanish ? "Cambiar boceto" : isFrench ? "Changer de croquis" : "Change sketch"}
              </button>
            </div>
          </div>
        )}

        {uploadPath && !isUploading ? (
          <div className="mt-3 w-full max-w-sm rounded-3xl border border-[var(--border)] bg-white p-4 md:max-w-md">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{isDutch ? "Thema tags" : isGerman ? "Themen-Tags" : isSpanish ? "Etiquetas de tema" : isFrench ? "Étiquettes de thème" : "Theme tags"}</p>
            <div className="space-y-2">
              {(Object.keys(THEME_TAGS) as ThemeCategory[]).map((category) => {
                const labelMap: Record<ThemeCategory, string> = {
                  ColorPalette: "ColorPalette",
                  Mood: "Mood",
                  StyleInfluence: "StyleInfluence",
                  Lighting: "Lighting",
                  Genre: isDutch ? "Themawereld" : isGerman ? "Themenwelt" : isSpanish ? "Mundo temático" : isFrench ? "Univers du thème" : "Theme world",
                  SpecialEffects: isDutch ? "Speciale effecten" : isGerman ? "Spezialeffekte" : isSpanish ? "Efectos especiales" : isFrench ? "Effets spéciaux" : "Special effects",
                  KeepMyDrawing: isDutch ? "Behoud mijn tekening" : isGerman ? "Meine Zeichnung beibehalten" : isSpanish ? "Mantén mi dibujo" : isFrench ? "Garder mon dessin" : "Keep my drawing",
                };

                return (
                  <TagPillSelector
                    key={category}
                    label={labelMap[category]}
                    options={[...(category === "Genre" ? genreOptions : THEME_TAGS[category])]}
                    values={tagSelection[category] as string[]}
                    maxSelected={MAX_PER_CATEGORY[category]}
                    onToggle={(value) => toggleTag(category, value)}
                    onClear={() => clearCategory(category)}
                  />
                );
              })}
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <label htmlFor="skin-tone" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {isDutch ? "Huidskleur" : isGerman ? "Hautfarbe" : isSpanish ? "Tono de piel" : isFrench ? "Carnation" : "Skin tone"}
                </label>
                <input
                  id="skin-tone"
                  type="text"
                  value={skinTone}
                  onChange={(event) => setSkinTone(event.target.value.slice(0, 80))}
                  placeholder={isDutch ? "bijv. warm medium, light, deep" : isGerman ? "z. B. warm medium, hell, dunkel" : isSpanish ? "p. ej. cálido medio, claro, profundo" : isFrench ? "ex. medium chaud, clair, foncé" : "e.g. warm medium, light, deep"}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-0 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label htmlFor="fantasy-skin" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {isDutch ? "Fantasy huid" : isGerman ? "Fantasy-Haut" : isSpanish ? "Piel de fantasía" : isFrench ? "Peau fantastique" : "Fantasy skin"}
                </label>
                <input
                  id="fantasy-skin"
                  type="text"
                  value={fantasySkin}
                  onChange={(event) => setFantasySkin(event.target.value.slice(0, 80))}
                  placeholder={isDutch ? "bijv. roze, groen, lavendel" : isGerman ? "z. B. rosa, grün, lavendel" : isSpanish ? "p. ej. rosa, verde, lavanda" : isFrench ? "ex. rose, vert, lavande" : "e.g. pink, green, lavender"}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-0 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label htmlFor="special-wishes" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {isDutch ? "Speciale wensen" : isGerman ? "Sonderwünsche hinzufügen" : isSpanish ? "Añadir deseos especiales" : isFrench ? "Ajouter des souhaits spéciaux" : "Add special wishes"}
                </label>
                <input
                  id="special-wishes"
                  type="text"
                  value={specialWishes}
                  onChange={(event) => setSpecialWishes(event.target.value.slice(0, 120))}
                  placeholder={isDutch ? "bijv. extra bloemen, zonsondergang-glow, geen glitter" : isGerman ? "z. B. extra Blumen, Sonnenuntergang-Glow, kein Glitzer" : isSpanish ? "p. ej. flores extra, brillo de atardecer, sin purpurina" : isFrench ? "ex. fleurs en plus, lueur coucher de soleil, sans paillettes" : "e.g. extra flowers, sunset glow, no glitter"}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-0 placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>
        ) : null}

        {!uploadPath && !isUploading && (
          <div className="mt-3">
            <MascotBubble
              size="sm"
              imageSrc="/mascot/bubble-mascot.webp"
              messages={[
                isDutch
                  ? `Go for it, ${displayName || "maker"}!`
                  : isGerman
                    ? `Los geht's, ${displayName || "Künstler"}!`
                    : isSpanish
                      ? `¡A por ello, ${displayName || "creador"}!`
                      : isFrench
                        ? `C'est parti, ${displayName || "créateur"} !`
                    : `Go for it, ${displayName || "creator"}!`,
                isDutch ? "PNG of JPG, allebei top." : isGerman ? "PNG oder JPG, beides funktioniert super." : isSpanish ? "PNG o JPG, ambos funcionan genial." : isFrench ? "PNG ou JPG, les deux marchent super." : "PNG or JPG, both work great.",
                isDutch ? "Strakke schets erin, strakke kleuren eruit." : isGerman ? "Saubere Skizze rein, saubere Farben raus." : isSpanish ? "Boceto limpio dentro, colores limpios fuera." : isFrench ? "Croquis net dedans, couleurs nettes dehors." : "Clean sketch in, clean colors out.",
              ]}
            />
          </div>
        )}
        </div>
      </div>

      <div className="mt-3 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Button onClick={() => { void runGenerate(); router.push("/app/preview"); }} disabled={!uploadPath || isUploading || isGenerating || isOffline} size="lg" className="w-full bg-[var(--accent-bg)] !text-neutral-900 hover:bg-[var(--accent-bg-hover)] disabled:bg-[var(--accent-bg-disabled)] disabled:!text-neutral-700">
          {isDutch ? "Genereer preview" : isGerman ? "Vorschau generieren" : isSpanish ? "Generar vista previa" : isFrench ? "Générer l'aperçu" : "Generate Preview"}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

