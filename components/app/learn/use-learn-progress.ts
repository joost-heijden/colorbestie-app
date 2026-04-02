"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type LearnProgress,
  SECTIONS,
  getLearnProgress,
  updateStreak,
  markTipComplete as markTipCompleteFn,
  getLevel,
  getXpForNextLevel,
  getDailyTip,
  isSectionUnlocked,
  getSectionProgress,
  isSectionComplete,
  isAllComplete,
  getTotalTipCount,
  getStreakMilestone,
  getNextMilestone,
} from "@/lib/learn-progress";

export function useLearnProgress() {
  const [progress, setProgress] = useState<LearnProgress>(() => getLearnProgress());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = getLearnProgress();
    const withStreak = updateStreak(stored);
    setProgress(withStreak);
    setHydrated(true);
  }, []);

  const completeTip = useCallback((tipFullId: string) => {
    setProgress((prev) => {
      const result = markTipCompleteFn(tipFullId, prev);
      return result.progress;
    });
  }, []);

  const completeTipWithFeedback = useCallback((tipFullId: string) => {
    let xpGained = 0;
    let sectionDone = false;
    setProgress((prev) => {
      const result = markTipCompleteFn(tipFullId, prev);
      xpGained = result.xpGained;
      sectionDone = result.sectionCompleted;
      return result.progress;
    });
    return { xpGained, sectionCompleted: sectionDone };
  }, []);

  const allComplete = isAllComplete(progress);
  const streakMilestone = getStreakMilestone(progress.currentStreak);
  const nextMilestone = getNextMilestone(progress.currentStreak);

  return {
    progress,
    hydrated,
    completeTip,
    completeTipWithFeedback,
    level: getLevel(progress.totalXp),
    xpProgress: getXpForNextLevel(progress.totalXp),
    totalXp: progress.totalXp,
    streak: progress.currentStreak,
    dailyTip: hydrated ? getDailyTip(progress) : null,
    sections: SECTIONS,
    isSectionUnlocked: (sectionId: string) => isSectionUnlocked(sectionId, progress),
    getSectionProgress: (sectionId: string) => getSectionProgress(sectionId, progress),
    isSectionComplete: (sectionId: string) => isSectionComplete(sectionId, progress),
    isTipCompleted: (tipId: string) => progress.completedTips.includes(tipId),
    allComplete,
    totalTipCount: getTotalTipCount(),
    completedTipCount: progress.completedTips.length,
    streakMilestone,
    nextMilestone,
  };
}
