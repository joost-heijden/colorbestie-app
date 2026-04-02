"use client";

type XpBarProps = {
  level: number;
  current: number;
  needed: number;
  percent: number;
  totalXp: number;
  isDutch?: boolean;
  isGerman?: boolean;
  isSpanish?: boolean;
  isFrench?: boolean;
};

export function XpBar({ level, current, needed, percent, totalXp, isDutch = false, isGerman = false, isSpanish = false, isFrench = false }: XpBarProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold text-[var(--text)]">{isDutch ? "Niveau" : isGerman ? "Level" : isSpanish ? "Nivel" : isFrench ? "Niveau" : "Level"} {level}</p>
        <p className="text-xs text-[var(--muted)]">{totalXp} XP {isDutch ? "totaal" : isGerman ? "gesamt" : isSpanish ? "total" : isFrench ? "total" : "total"}</p>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[var(--accent-weak)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-700 ease-out"
          style={{ width: `${Math.round(percent * 100)}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-[var(--muted)]">
        {current} / {needed} XP {isDutch ? "tot volgend niveau" : isGerman ? "bis zum nächsten Level" : isSpanish ? "hasta el siguiente nivel" : isFrench ? "jusqu'au niveau suivant" : "to next level"}
      </p>
    </div>
  );
}
