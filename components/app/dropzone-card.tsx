"use client";

import Image from "next/image";
import { useRef } from "react";

type DropzoneCardProps = {
  selectedFile: File | null;
  previewUrl: string | null;
  isDragging: boolean;
  isUploading: boolean;
  disabled?: boolean;
  onPickFile: (file: File) => void | Promise<void>;
  onDragStateChange: (active: boolean) => void;
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

export function DropzoneCard({
  selectedFile,
  previewUrl,
  isDragging,
  isUploading,
  disabled = false,
  onPickFile,
  onDragStateChange,
}: DropzoneCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File | null) => {
    if (disabled) return;
    if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
    void onPickFile(file);
  };

  return (
    <section className="card-soft p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text)]">Your sketch</h2>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {selectedFile ? "Swap sketch" : "Pick sketch"}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => processFile(event.target.files?.[0] ?? null)} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          onDragStateChange(true);
        }}
        onDragLeave={() => onDragStateChange(false)}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          onDragStateChange(false);
          processFile(event.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-4 py-10 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent-weak)]/40 shadow-[0_0_0_8px_rgba(255,138,255,0.16)]"
            : "border-[var(--border)] bg-[var(--surface-2)]/70 hover:border-[var(--accent)]/50"
        }`}
      >
        {previewUrl ? (
          <>
            <div className="relative h-44 w-full max-w-xs overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
              <Image src={previewUrl} alt="Selected preview" fill className="object-cover" />
            </div>
            <p className="mt-4 line-clamp-1 max-w-xs text-sm font-medium text-[var(--text)]">{selectedFile?.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Ready for cozy marker styling</p>
            {isUploading ? <p className="mt-2 text-xs font-medium text-[var(--text)]">Uploading your sketch…</p> : null}
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-[var(--text)]">Drop your sketch photo here</p>
            <p className="mt-2 text-xs text-[var(--muted)]">PNG or JPG — whatever feels easiest ✨</p>
          </>
        )}
      </button>
    </section>
  );
}
