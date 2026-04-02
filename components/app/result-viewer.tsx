"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { MascotBubble } from "@/components/brand/mascot-bubble";
import { Button } from "@/components/ui/button";

type ResultViewerProps = {
  resultUrl: string | null;
  loadingStep: string;
  isGenerating: boolean;
  isOffline: boolean;
  onDownload: () => void;
  onGenerateAgain: () => void;
  onOpenUpload: () => void;
};

export function ResultViewer({
  resultUrl,
  loadingStep,
  isGenerating,
  isOffline,
  onDownload,
  onGenerateAgain,
  onOpenUpload,
}: ResultViewerProps) {
  return (
    <section className="card-soft h-full p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="text-sm font-semibold text-[var(--text)] sm:text-base">Preview</h2>
      </div>

      {isOffline ? (
        <div className="flex h-[58vh] min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] px-6 text-center text-sm text-[var(--muted)]">
          <ImageIcon className="h-7 w-7 text-[var(--accent)]" />
          <p className="font-semibold text-[var(--text)]">You are offline</p>
          <p className="max-w-xs text-xs sm:text-sm">Reconnect to continue generating and downloading your latest marker preview.</p>
          <Button type="button" variant="ghost" onClick={onOpenUpload}>
            Back to upload
          </Button>
        </div>
      ) : null}

      {!isOffline && !resultUrl && !isGenerating ? (
        <div className="flex h-[58vh] min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] text-sm text-[var(--muted)]">
          <ImageIcon className="h-7 w-7 text-[var(--accent)]" />
          <p className="font-medium text-[var(--text)]">Your preview will appear here.</p>
          <p className="text-xs">Upload your sketch first, then generate the marker preview.</p>
          <MascotBubble size="sm" imageSrc="/mascot/bubble-mascot.webp" messages={["Upload first, then let me cook the colors.","Start with one sketch, test multiple moods.","Your next palette starts at upload."]} className="mt-2" />
        </div>
      ) : null}

      {!isOffline && isGenerating ? (
        <div className="space-y-4">
          <div className="h-[58vh] min-h-64 animate-pulse rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#fff0f5] to-[#ffe4ee]" />
          <p className="text-sm font-medium text-[var(--muted)]">{loadingStep}</p>
          <MascotBubble size="sm" imageSrc="/mascot/bubble-mascot.webp" messages={["Mixing tones, this one's going to pop.","Balancing saturation and contrast now.","Almost there - final marker pass in progress."]} />
        </div>
      ) : null}

      {!isOffline && resultUrl && !isGenerating ? (
        <div className="space-y-4">
          <div className="relative h-[58vh] min-h-64 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]">
            <Image src={resultUrl} alt="Generated result" fill className="object-cover" unoptimized />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={onDownload}>
              Download preview
            </Button>
            <Button type="button" onClick={onGenerateAgain}>
              Generate another version
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}


