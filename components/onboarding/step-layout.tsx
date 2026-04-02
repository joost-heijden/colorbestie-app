import { Button } from "@/components/ui/button";

type Props = {
  step: number;
  total: number;
  children: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  onNext?: () => void;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  stepLabel?: string;
};

export function StepLayout({ step, total, children, onBack, backLabel = "Back", onNext, ctaLabel = "Continue", ctaDisabled, stepLabel = "Step" }: Props) {
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-hero flex-col px-6 pt-6 md:px-10">
      <p className="text-sm text-[var(--muted)]">{stepLabel} {step} / {total}</p>

      <div className="min-h-0 flex-1 overflow-y-auto py-4 pb-20 md:pb-24">{children}</div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-hero px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:px-10">
          <div className="flex gap-3">
            {onBack ? (
              <Button type="button" variant="ghost" onClick={onBack} className="h-10 border border-[var(--border)] bg-white px-4 text-lg md:h-14 md:px-6 md:text-2xl">
                {backLabel}
              </Button>
            ) : null}
            {onNext && ctaLabel ? (
              <Button type="button" onClick={onNext} disabled={ctaDisabled} className="h-10 flex-1 text-lg md:h-14 md:text-2xl">
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
