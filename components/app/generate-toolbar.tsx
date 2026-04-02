"use client";

type GenerateToolbarProps = {
  disabled: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  ctaLabel?: string;
  disabledHint?: string;
};

export function GenerateToolbar({
  disabled,
  isGenerating,
  onGenerate,
  ctaLabel = "Generate marker preview",
  disabledHint = "Upload a sketch to enable preview generation.",
}: GenerateToolbarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:inset-auto sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-[0_8px_24px_-10px_var(--accent-strong)] transition hover:shadow-[0_12px_40px_rgba(255,138,255,0.25)] disabled:cursor-not-allowed disabled:bg-[var(--accent-bg-disabled)] disabled:shadow-none"
      >
        {isGenerating ? "Generating preview..." : ctaLabel}
      </button>
      {disabled ? <p className="mt-2 text-center text-xs text-[var(--muted)]">{disabledHint}</p> : null}
    </div>
  );
}
