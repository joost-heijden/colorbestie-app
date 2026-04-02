"use client";

import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

type DailyTipCardProps = {
  sectionTitle: string;
  tipTitle: string;
  tipDesc: string;
  isCompleted: boolean;
  isReview?: boolean;
  onComplete: () => void;
  isDutch?: boolean;
  isGerman?: boolean;
  isSpanish?: boolean;
  isFrench?: boolean;
};

export function DailyTipCard({ sectionTitle, tipTitle, tipDesc, isCompleted, isReview, onComplete, isDutch = false, isGerman = false, isSpanish = false, isFrench = false }: DailyTipCardProps) {
  const [celebrating, setCelebrating] = useState(false);

  const handleComplete = () => {
    if (isCompleted && !isReview) return;
    setCelebrating(true);
    onComplete();
    setTimeout(() => setCelebrating(false), 500);
  };

  return (
    <div className={`rounded-2xl border-2 ${isReview ? "border-[var(--muted)]/20 bg-[var(--surface-2)]" : "border-[var(--accent)]/30 bg-[var(--accent-weak)]"} p-4 ${celebrating ? "animate-celebrate" : ""}`}>
      <div className="flex items-center gap-2">
        {isReview ? (
          <BookOpen className="h-4 w-4 text-[var(--muted)]" />
        ) : (
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        )}
        <p className={`text-xs font-semibold uppercase tracking-wider ${isReview ? "text-[var(--muted)]" : "text-[var(--accent)]"}`}>
          {isReview ? (isDutch ? "Reviewtip" : isGerman ? "Review-Tipp" : isSpanish ? "Consejo de repaso" : isFrench ? "Conseil de révision" : "Review tip") : (isDutch ? "Tip van de dag" : isGerman ? "Tipp des Tages" : isSpanish ? "Consejo del día" : isFrench ? "Conseil du jour" : "Tip of the day") }
        </p>
      </div>
      <span className="mt-1 inline-block rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
        {sectionTitle}
      </span>
      <p className="mt-2 font-semibold text-[var(--text)]">{tipTitle}</p>
      <p className="mt-0.5 text-sm text-[var(--muted)]">{tipDesc}</p>
      {!isReview && (
        <button
          type="button"
          onClick={handleComplete}
          disabled={isCompleted}
          className={`mt-3 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            isCompleted
              ? "bg-white/50 text-[var(--muted)]"
              : "bg-white text-[var(--text)] shadow-sm hover:shadow-md active:scale-95"
          }`}
        >
          {isCompleted ? (isDutch ? "Klaar!" : isGerman ? "Erledigt!" : isSpanish ? "¡Hecho!" : isFrench ? "Fait !" : "Done!") : (isDutch ? "Snap ik!" : isGerman ? "Verstanden!" : isSpanish ? "¡Entendido!" : isFrench ? "Compris !" : "Got it!")}
        </button>
      )}
      {isReview && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          {isDutch ? "Fris je geheugen op — bekijk deze tip vandaag opnieuw." : isGerman ? "Frische dein Gedächtnis auf — schau dir diesen Tipp heute nochmal an." : isSpanish ? "Refresca la memoria: vuelve a revisar este consejo hoy." : isFrench ? "Rafraîchis ta mémoire — revois ce conseil aujourd'hui." : "Refresh your memory — revisit this tip today."}
        </p>
      )}
    </div>
  );
}
