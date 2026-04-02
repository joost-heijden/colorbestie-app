"use client";

type StreakBadgeProps = {
  streak: number;
  streakEmoji: string;
  nextMilestone: { days: number; label: string } | null;
  isDutch?: boolean;
  isGerman?: boolean;
  isSpanish?: boolean;
  isFrench?: boolean;
};

export function StreakBadge({ streak, streakEmoji, nextMilestone, isDutch = false, isGerman = false, isSpanish = false, isFrench = false }: StreakBadgeProps) {
  const milestoneLabel = isDutch
    ? nextMilestone?.label === "3 days"
      ? "3 dagen"
      : nextMilestone?.label === "1 week"
        ? "1 week"
        : nextMilestone?.label === "2 weeks"
          ? "2 weken"
          : nextMilestone?.label === "1 month"
            ? "1 maand"
            : nextMilestone?.label === "2 months"
              ? "2 maanden"
              : nextMilestone?.label === "100 days"
                ? "100 dagen"
                : nextMilestone?.label
    : isGerman
      ? nextMilestone?.label === "3 days"
        ? "3 Tage"
        : nextMilestone?.label === "1 week"
          ? "1 Woche"
          : nextMilestone?.label === "2 weeks"
            ? "2 Wochen"
            : nextMilestone?.label === "1 month"
              ? "1 Monat"
              : nextMilestone?.label === "2 months"
                ? "2 Monate"
                : nextMilestone?.label === "100 days"
                  ? "100 Tage"
                  : nextMilestone?.label
      : isSpanish
        ? nextMilestone?.label === "3 days"
          ? "3 días"
          : nextMilestone?.label === "1 week"
            ? "1 semana"
            : nextMilestone?.label === "2 weeks"
              ? "2 semanas"
              : nextMilestone?.label === "1 month"
                ? "1 mes"
                : nextMilestone?.label === "2 months"
                  ? "2 meses"
                  : nextMilestone?.label === "100 days"
                    ? "100 días"
                    : nextMilestone?.label
        : isFrench
          ? nextMilestone?.label === "3 days"
            ? "3 jours"
            : nextMilestone?.label === "1 week"
              ? "1 semaine"
              : nextMilestone?.label === "2 weeks"
                ? "2 semaines"
                : nextMilestone?.label === "1 month"
                  ? "1 mois"
                  : nextMilestone?.label === "2 months"
                    ? "2 mois"
                    : nextMilestone?.label === "100 days"
                      ? "100 jours"
                      : nextMilestone?.label
      : nextMilestone?.label;

  if (streak < 1) {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--muted)]">
          {isDutch ? "Start een streak! Kom dagelijks terug om momentum op te bouwen." : isGerman ? "Starte eine Streak! Komm täglich zurück, um Momentum aufzubauen." : isSpanish ? "¡Empieza una racha! Vuelve cada día para ganar impulso." : isFrench ? "Commence une série ! Reviens chaque jour pour garder l'élan." : "Start a streak! Visit daily to build momentum."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-weak)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
          <span aria-hidden="true">{streakEmoji}</span> {streak} {isDutch ? "dagen streak" : isGerman ? "Tage Streak" : isSpanish ? "días de racha" : isFrench ? "jours de série" : "day streak"}
        </span>
        {streak >= 7 && (
          <span className="text-[10px] font-semibold text-[var(--accent)]">
            {isDutch ? "Geweldig!" : isGerman ? "Mega!" : isSpanish ? "¡Increíble!" : isFrench ? "Incroyable !" : "Amazing!"}
          </span>
        )}
      </div>
      {nextMilestone && (
        <p className="text-[10px] text-[var(--muted)]">
          {nextMilestone.days === 1
            ? (isDutch ? `Kom morgen terug voor de ${milestoneLabel}-mijlpaal!` : isGerman ? `Komm morgen zurück für den ${milestoneLabel}-Meilenstein!` : isSpanish ? `¡Vuelve mañana para alcanzar el hito de ${milestoneLabel}!` : isFrench ? `Reviens demain pour atteindre le palier ${milestoneLabel} !` : `Come back tomorrow for the ${milestoneLabel} milestone!`)
            : (isDutch ? `${nextMilestone.days} dagen tot ${milestoneLabel}-mijlpaal` : isGerman ? `${nextMilestone.days} Tage bis zum ${milestoneLabel}-Meilenstein` : isSpanish ? `${nextMilestone.days} días para el hito de ${milestoneLabel}` : isFrench ? `${nextMilestone.days} jours avant le palier ${milestoneLabel}` : `${nextMilestone.days} days until ${milestoneLabel} milestone`)}
        </p>
      )}
      {!nextMilestone && streak >= 100 && (
        <p className="text-[10px] font-semibold text-[var(--accent)]">
          {isDutch ? "Legendarische streak! Je bent niet te stoppen!" : isGerman ? "Legendäre Streak! Du bist nicht aufzuhalten!" : isSpanish ? "¡Racha legendaria! ¡Eres imparable!" : isFrench ? "Série légendaire ! Tu es inarrêtable !" : "Legendary streak! You are unstoppable!"}
        </p>
      )}
      {streak >= 1 && (
        <p className="text-[10px] text-[var(--muted)]">
          {isDutch ? "Kom morgen terug om je streak gaande te houden!" : isGerman ? "Komm morgen zurück, um deine Streak am Leben zu halten!" : isSpanish ? "¡Vuelve mañana para mantener tu racha!" : isFrench ? "Reviens demain pour garder ta série en vie !" : "Come back tomorrow to keep your streak going!"}
        </p>
      )}
    </div>
  );
}
