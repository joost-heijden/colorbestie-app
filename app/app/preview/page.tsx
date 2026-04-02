"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ImageIcon, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useColorBestie } from "@/components/app/colorbestie-provider";

export default function PreviewPage() {
  const router = useRouter();
  const {
    resultUrl,
    uploadPreviewUrl,
    isGenerating,
    isOffline,
    downloadResult,
    resetFlow,
    uiLanguage,
  } = useColorBestie();
  const isDutch = uiLanguage === "nl";
  const isGerman = uiLanguage === "de";
  const isSpanish = uiLanguage === "es";
  const isFrench = uiLanguage === "fr";
  const imageVisible = !!resultUrl && !isGenerating && !isOffline;

  const visualSteps = useMemo(
    () => [
      isDutch ? "Je marker preview wordt voorbereid..." : isGerman ? "Deine Marker-Vorschau wird vorbereitet..." : isSpanish ? "Preparando tu vista previa de marcadores..." : isFrench ? "Préparation de ton aperçu markers..." : "Preparing your marker preview...",
      isDutch ? "Kleuren worden gemengd..." : isGerman ? "Farben werden gemischt..." : isSpanish ? "Mezclando colores..." : isFrench ? "Mélange des couleurs..." : "Blending colors...",
      isDutch ? "Preview wordt afgerond..." : isGerman ? "Vorschau wird finalisiert..." : isSpanish ? "Finalizando vista previa..." : isFrench ? "Finalisation de l'aperçu..." : "Finalizing preview...",
    ],
    [isDutch, isGerman, isSpanish]
  );

  const [visualStepIndex, setVisualStepIndex] = useState(0);
  const [visualProgress, setVisualProgress] = useState(8);

  useEffect(() => {
    if (!isGenerating) {
      setVisualStepIndex(0);
      setVisualProgress(8);
      return;
    }

    let cancelled = false;
    const progressTimer = window.setInterval(() => {
      if (cancelled) return;
      setVisualProgress((prev) => {
        const target = 92;
        const delta = Math.max(0.8, (target - prev) * 0.08);
        return Math.min(target, prev + delta);
      });
    }, 220);

    (async () => {
      setVisualStepIndex(0);
      await new Promise((r) => setTimeout(r, 1200));
      if (!cancelled) setVisualStepIndex(1);
      await new Promise((r) => setTimeout(r, 1400));
      if (!cancelled) setVisualStepIndex(2);
    })();

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (resultUrl && !isGenerating) {
      setVisualProgress(100);
    }
  }, [resultUrl, isGenerating]);

  const displayedStep = visualSteps[Math.min(visualStepIndex, visualSteps.length - 1)];

  const handleNewSketch = () => {
    resetFlow();
    router.push("/app/upload");
  };

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-2 md:px-8">
      {/* Header */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          {isDutch ? "Stap 3" : isGerman ? "Schritt 3" : isSpanish ? "Paso 3" : isFrench ? "Étape 3" : "Step 3"}
        </p>
        <h1 className="mt-1 text-2xl font-black text-[var(--text)]">
          {isDutch ? "Jouw preview" : isGerman ? "Deine Vorschau" : isSpanish ? "Tu vista previa" : isFrench ? "Ton aperçu" : "Your Preview"}
        </h1>
      </div>

      {/* Preview area */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
        {isOffline ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <ImageIcon className="h-10 w-10 text-[var(--muted)]" />
            <p className="font-semibold text-[var(--text)]">{isDutch ? "Je bent offline" : isGerman ? "Du bist offline" : isSpanish ? "Estás sin conexión" : isFrench ? "Tu es hors ligne" : "You are offline"}</p>
            <p className="text-sm text-[var(--muted)]">
              {isDutch ? "Verbind opnieuw om je marker preview te genereren." : isGerman ? "Verbinde dich erneut, um deine Marker-Vorschau zu generieren." : isSpanish ? "Vuelve a conectarte para generar tu vista previa de marcadores." : isFrench ? "Reconnecte-toi pour générer ton aperçu markers." : "Reconnect to generate your marker preview."}
            </p>
          </div>
        ) : isGenerating ? (
          <div className="flex w-full flex-col items-center gap-5">
            <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#fff0f5] to-[#ffe4ee]">
              {uploadPreviewUrl ? (
                <Image
                  src={uploadPreviewUrl}
                  alt="Uploaded sketch placeholder"
                  fill
                  className="object-cover opacity-30 blur-[2px]"
                  unoptimized
                />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/35 to-white/10 animate-pulse" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-overlay-sweep" />
                <div className="absolute -left-1/3 top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-overlay-sweep" style={{ animationDelay: "900ms" }} />
                <div className="absolute left-[12%] top-[20%] h-3 w-3 rounded-full bg-white/80 animate-overlay-float" style={{ animationDelay: "0ms" }} />
                <div className="absolute right-[15%] top-[30%] h-3 w-3 rounded-full bg-white/75 animate-overlay-float" style={{ animationDelay: "320ms" }} />
                <div className="absolute left-[58%] top-[16%] h-2.5 w-2.5 rounded-full bg-white/80 animate-overlay-float" style={{ animationDelay: "620ms" }} />
                <div className="absolute left-[44%] top-[34%] h-2 w-2 rounded-full bg-white/70 animate-overlay-float" style={{ animationDelay: "980ms" }} />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full border border-white/60 bg-white/78 px-3 py-1 text-xs font-semibold text-[var(--text)] backdrop-blur">
                  {isDutch ? "Je marker vibe wordt gerenderd…" : isGerman ? "Dein Marker-Vibe wird gerendert…" : isSpanish ? "Renderizando tu estilo de marcador…" : isFrench ? "Rendu de ton style marker…" : "Rendering your marker vibe…"}
                </div>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_8px_24px_-18px_var(--shadow)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--text)]">{isDutch ? "Je preview wordt gegenereerd" : isGerman ? "Deine Vorschau wird generiert" : isSpanish ? "Generando tu vista previa" : isFrench ? "Génération de ton aperçu" : "Generating your preview"}</p>
                <span className="text-xs font-medium text-[var(--muted)]">{isDutch ? "Meestal 8–15 sec" : isGerman ? "Meistens 8–15 Sek." : isSpanish ? "Normalmente 8–15 s" : isFrench ? "En général 8–15 s" : "Usually 8–15 sec"}</span>
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div className="relative h-full w-full">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]/85 transition-[width] duration-500 ease-out" style={{ width: `${visualProgress}%` }} />
                  <div className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-white/90 to-transparent animate-progress-indeterminate" />
                </div>
              </div>

              <p className="mt-3 text-sm font-medium text-[var(--text)]">{displayedStep}</p>
              <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
                <p>{isDutch ? "• Palet afgestemd op je marker set" : isGerman ? "• Palette an dein Marker-Setup angepasst" : isSpanish ? "• Paleta ajustada a tu configuración de marcadores" : isFrench ? "• Palette adaptée à ta configuration markers" : "• Palette matched to your marker setup"}</p>
                <p>{isDutch ? "• Contrast en diepte worden gebalanceerd" : isGerman ? "• Kontrast und Tiefe werden ausbalanciert" : isSpanish ? "• Equilibrando contraste y profundidad" : isFrench ? "• Équilibrage du contraste et de la profondeur" : "• Balancing contrast and depth"}</p>
                <p>{isDutch ? "• Laatste renderpass bezig" : isGerman ? "• Letzter Render-Durchlauf läuft" : isSpanish ? "• Última pasada de render en curso" : isFrench ? "• Dernière passe de rendu en cours" : "• Final render pass in progress"}</p>
              </div>

              <p className="mt-3 text-xs text-[var(--muted)]">{isDutch ? "Je kunt de app veilig sluiten — je concept blijft bewaard." : isGerman ? "Du kannst die App sicher schließen — dein Entwurf bleibt gespeichert." : isSpanish ? "Puedes cerrar la app con seguridad: tu borrador se guarda." : isFrench ? "Tu peux fermer l'app en sécurité — ton brouillon reste sauvegardé." : "Safe to close app — your draft stays saved."}</p>
            </div>
          </div>
        ) : resultUrl ? (
          <div className="w-full">
            <div className="relative h-[52vh] min-h-[260px] w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]">
              <img
                src={resultUrl}
                alt="Generated marker preview"
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-weak)]">
              <Sparkles className="h-7 w-7 text-[var(--accent)]" />
            </div>
            <p className="font-semibold text-[var(--text)]">
              {isDutch ? "Je preview verschijnt hier" : isGerman ? "Deine Vorschau erscheint hier" : isSpanish ? "Tu vista previa aparecerá aquí" : isFrench ? "Ton aperçu apparaîtra ici" : "Your preview will appear here"}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {isDutch ? "Upload eerst een schets en genereer een preview." : isGerman ? "Lade zuerst eine Skizze hoch und generiere eine Vorschau." : isSpanish ? "Primero sube un boceto y genera una vista previa." : isFrench ? "Télécharge d'abord un croquis et génère un aperçu." : "Upload a sketch and generate a preview first."}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {imageVisible && (
        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={() => void downloadResult()} size="lg" className="w-full gap-2">
            <Download className="h-4 w-4" />
            {isDutch ? "Download preview" : isGerman ? "Vorschau herunterladen" : isSpanish ? "Descargar vista previa" : isFrench ? "Télécharger l'aperçu" : "Download Preview"}
          </Button>
          <Button variant="ghost" onClick={handleNewSketch} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            {isDutch ? "Nieuwe schets" : isGerman ? "Neue Skizze" : isSpanish ? "Nuevo boceto" : isFrench ? "Nouveau croquis" : "New Sketch"}
          </Button>
        </div>
      )}
    </div>
  );
}

