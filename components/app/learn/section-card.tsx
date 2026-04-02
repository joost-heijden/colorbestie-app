"use client";

import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { tipId, type Section } from "@/lib/learn-progress";

type SectionCardProps = {
  section: Section;
  isUnlocked: boolean;
  completedCount: number;
  isTipCompleted: (id: string) => boolean;
  onCompleteTip: (id: string) => { xpGained: number; sectionCompleted: boolean };
  isDutch?: boolean;
  isGerman?: boolean;
  isSpanish?: boolean;
  isFrench?: boolean;
};

export function SectionCard({ section, isUnlocked, completedCount, isTipCompleted, onCompleteTip, isDutch = false, isGerman = false, isSpanish = false, isFrench = false }: SectionCardProps) {
  const [floatingXp, setFloatingXp] = useState<{ id: string; amount: number } | null>(null);
  const [sectionCelebrate, setSectionCelebrate] = useState(false);

  const total = section.items.length;
  const progressPercent = total > 0 ? completedCount / total : 0;
  const isComplete = completedCount === total;

  const handleComplete = (index: number) => {
    const id = tipId(section.id, index);
    if (isTipCompleted(id)) return;

    const result = onCompleteTip(id);
    setFloatingXp({ id, amount: result.xpGained });
    setTimeout(() => setFloatingXp(null), 1100);

    if (result.sectionCompleted) {
      setSectionCelebrate(true);
      setTimeout(() => setSectionCelebrate(false), 600);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--muted)]" />
            <h3 className="text-sm font-semibold text-[var(--muted)]">{section.title}</h3>
          </div>
          <span className="text-xs text-[var(--muted)]">{isDutch ? "Vergrendeld" : isGerman ? "Gesperrt" : isSpanish ? "Bloqueado" : isFrench ? "Verrouillé" : "Locked"}</span>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">{isDutch ? "Voltooi een tip in de vorige sectie om te ontgrendelen." : isGerman ? "Schließe einen Tipp im vorherigen Abschnitt ab, um zu entsperren." : isSpanish ? "Completa un consejo en la sección anterior para desbloquear." : isFrench ? "Termine un conseil dans la section précédente pour déverrouiller." : "Complete a tip in the previous section to unlock."}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-white p-4 ${sectionCelebrate ? "animate-celebrate" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">{section.title}</h3>
        <span className={`text-xs font-medium ${isComplete ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
          {completedCount}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--accent-weak)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
          style={{ width: `${Math.round(progressPercent * 100)}%` }}
        />
      </div>

      {sectionCelebrate && (
        <p className="mt-2 text-center text-xs font-bold text-[var(--accent)] animate-celebrate">
          {isDutch ? "+50 XP sectiebonus!" : isGerman ? "+50 XP Abschnittsbonus!" : isSpanish ? "¡+50 XP de bonificación por sección!" : isFrench ? "+50 XP bonus de section !" : "+50 XP Section Bonus!"}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {section.items.map(([title, desc], i) => {
          const id = tipId(section.id, i);
          const done = isTipCompleted(id);

          return (
            <div key={id} className="relative flex items-start gap-3">
              <button
                type="button"
                onClick={() => handleComplete(i)}
                disabled={done}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  done
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-[var(--border)] bg-white hover:border-[var(--accent)]/50"
                }`}
              >
                {done && <Check className="h-3.5 w-3.5 text-white animate-check-fill" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? "text-[var(--muted)] line-through" : "text-[var(--text)]"}`}>
                  {title}
                </p>
                <p className="text-xs text-[var(--muted)]">{desc}</p>
              </div>
              {floatingXp?.id === id && (
                <span className="absolute -top-1 right-0 text-xs font-bold text-[var(--accent)] animate-xp-float">
                  +{floatingXp.amount} XP
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
