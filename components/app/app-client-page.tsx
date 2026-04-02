"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RefreshCw, Sparkles, Upload, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { GenerateToolbar } from "@/components/app/generate-toolbar";
import { ResultViewer } from "@/components/app/result-viewer";
import { ThemeChips } from "@/components/app/theme-chips";
import { Topbar } from "@/components/app/topbar";
import { Button } from "@/components/ui/button";

const THEMES = [
  "Smooth blend",
  "High contrast",
  "Pastel soft",
  "Realistic light",
  "Vintage print",
  "Kawaii",
  "Fantasy",
  "Galaxy",
  "Dreamy",
  "Colorful",
  "Rainbow",
  "Spooky",
  "Christmas",
  "Glitter",
  "Fluffy",
  "Rainy",
  "Two colors",
  "Three colors",
  "White liners (special effects)",
] as const;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type PlanUploadResponse = { uploadUrl: string; path: string };
type GenerateResponse = { resultUrl: string; resultPath: string };
type Stage = "upload" | "result";
type PreviewState = "upload" | "result" | "loading" | "offline";

type AppClientPageProps = {
  email: string;
  previewState?: PreviewState;
  previewResultUrl?: string;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AppClientPage({
  email,
  previewState,
  previewResultUrl = "/mascot/scene-sit-rainbow.webp",
}: AppClientPageProps) {
  const isPreviewMode = !!previewState;
  const forceOffline = previewState === "offline";
  const initialStage: Stage = previewState && previewState !== "upload" ? "result" : "upload";

  const [stage, setStage] = useState<Stage>(initialStage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState<string | null>(isPreviewMode ? "preview/mock-upload.jpg" : null);
  const [resultUrl, setResultUrl] = useState<string | null>(previewState === "result" ? previewResultUrl : null);
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(previewState === "loading");
  const [loadingStep, setLoadingStep] = useState("Preparing your marker preview...");
  const [isOffline, setIsOffline] = useState(forceOffline);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (forceOffline) {
      setIsOffline(true);
      return;
    }

    const syncOnlineState = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
      if (online) {
        toast("Back online. You can continue generating.");
      }
    };

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, [forceOffline]);

  const canGenerate = useMemo(
    () => !!uploadPath && !isUploading && !isGenerating && !isOffline,
    [uploadPath, isUploading, isGenerating, isOffline]
  );

  const canOpenPreview = !!uploadPath && !isUploading && !isOffline;

  const uploadSelectedFile = async (file: File) => {
    if (isOffline) {
      toast("You are offline. Upload is paused.");
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast("Please choose a PNG or JPG image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast("File is too large. Max 10MB.");
      return;
    }

    try {
      setIsUploading(true);
      setSelectedFile(file);
      setResultUrl(null);

      const uploadMetaResponse = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });

      if (!uploadMetaResponse.ok) throw new Error("Could not create upload URL");

      const uploadMeta = (await uploadMetaResponse.json()) as PlanUploadResponse;
      const uploadResponse = await fetch(uploadMeta.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      setUploadPath(uploadMeta.path);
      toast("Sketch uploaded.");
    } catch {
      setUploadPath(null);
      toast("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const runGenerate = async () => {
    if (!uploadPath || isGenerating || isOffline) return;

    try {
      setIsGenerating(true);
      setLoadingStep("Preparing your marker preview...");
      setStage("result");

      if (isPreviewMode) {
        await wait(1200);
        setResultUrl(previewResultUrl);
        return;
      }

      const progressTimer = window.setInterval(() => {
        setLoadingStep((current) => {
          if (current === "Preparing your marker preview...") return "Blending colors...";
          if (current === "Blending colors...") return "Finalizing preview...";
          return "Finalizing preview...";
        });
      }, 1000);

      const generatePromise = fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadPath, theme: selectedTheme }),
      });

      const [, generateResponse] = await Promise.all([wait(3000), generatePromise]);
      window.clearInterval(progressTimer);

      if (generateResponse.status === 402) {
        toast("Unlock required before generating.");
        return;
      }

      if (!generateResponse.ok) {
        toast("Could not generate right now. Please try again.");
        return;
      }

      const data = (await generateResponse.json()) as GenerateResponse;
      setResultUrl(data.resultUrl);
      toast("Preview ready.");
    } catch {
      toast("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingStep("Preparing your marker preview...");
    }
  };

  const onDownload = () => {
    if (!resultUrl) return;
    const anchor = document.createElement("a");
    anchor.href = resultUrl;
    anchor.download = "colorbestie-marker-preview";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const retryConnection = () => {
    if (forceOffline) {
      toast("Offline preview mode is active.");
      return;
    }

    if (navigator.onLine) {
      setIsOffline(false);
      toast("Connection restored.");
    } else {
      setIsOffline(true);
      toast("Still offline. Check your connection and try again.");
    }
  };

  return (
    <main className="mx-auto h-[100dvh] w-full max-w-hero overflow-hidden px-3 py-3 pb-24 sm:px-4 sm:py-4 md:px-8">
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden sm:gap-4">
        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-[0_16px_40px_-22px_var(--shadow)] sm:p-3">
          <div className="absolute inset-0 opacity-25">
            <Image src="/mascot/scene-sit-rainbow.webp" alt="Mascot background" fill className="object-cover" />
          </div>
          <div className="relative z-10">
            <Topbar subtitle="Upload your sketch, choose a style, and generate a marker-ready preview." email={email} />
          </div>
        </section>

        {isOffline ? (
          <section className="card-soft rounded-2xl border-amber-200/70 bg-amber-50/80 p-3">
            <div className="flex items-start gap-3">
              <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-900">You are offline</p>
                <p className="text-xs text-amber-800/80 sm:text-sm">Uploads and generation are paused until your connection returns.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={retryConnection} className="h-8 rounded-xl px-3 text-xs">
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          </section>
        ) : (
          <section className="card-soft p-2.5 sm:p-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "sketch", label: "1. Sketch", active: !!selectedFile || stage === "upload" },
                { key: "style", label: "2. Style", active: !!selectedTheme },
                { key: "preview", label: "3. Preview", active: stage === "result" || !!resultUrl || isGenerating },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`rounded-2xl px-2 py-2 text-center text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                    item.active ? "bg-[var(--accent-weak)] text-[var(--text)]" : "bg-[var(--surface-2)] text-[var(--muted)]"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="min-h-0 flex-1 overflow-hidden">
          {stage === "upload" ? (
            <section className="card-soft flex h-full flex-col justify-between p-3 sm:p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Upload sketch</p>
                <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                  Choose a PNG or JPG, pick your style, then open preview to generate.
                </p>

                <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 sm:mt-4">
                  <p className="text-xs text-[var(--muted)]">Selected file</p>
                  <p className="mt-1 line-clamp-1 text-sm font-medium text-[var(--text)]">
                    {selectedFile ? selectedFile.name : "No sketch selected yet"}
                  </p>
                </div>

                <div className="mt-3 sm:mt-4">
                  <ThemeChips themes={[...THEMES]} selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isOffline}
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "1. Choose sketch"}
                </Button>
                <Button type="button" onClick={() => setStage("result")} disabled={!canOpenPreview}>
                  2. Open preview
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadSelectedFile(file);
                }}
              />
            </section>
          ) : (
            <div className="flex h-full flex-col gap-2.5 sm:gap-3">
              <div className="min-h-0 flex-1 overflow-hidden">
                <ResultViewer
                  resultUrl={resultUrl}
                  loadingStep={loadingStep}
                  isGenerating={isGenerating}
                  isOffline={isOffline}
                  onDownload={onDownload}
                  onGenerateAgain={runGenerate}
                  onOpenUpload={() => setStage("upload")}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStage("upload")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to upload
                </Button>
                <Button variant="ghost" onClick={retryConnection} disabled={forceOffline} className="gap-2">
                  <Wifi className="h-4 w-4" />
                  Check connection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GenerateToolbar
        disabled={!canGenerate || stage !== "result"}
        isGenerating={isGenerating}
        onGenerate={runGenerate}
        ctaLabel="3. Generate marker preview"
        disabledHint={isOffline ? "Reconnect to generate your preview." : "Upload a sketch and open preview to continue."}
      />
    </main>
  );
}

