export const LEARN_STORAGE_KEY = "colorbestie-learn-progress";

export type LearnProgress = {
  completedTips: string[];
  currentStreak: number;
  lastVisitDate: string;
  totalXp: number;
  unlockedSections: string[];
  dailyTipDate: string;
  dailyTipId: string;
};

const XP_PER_TIP = 15;
const XP_DAILY_VISIT = 10;
const XP_SECTION_BONUS = 50;

const DEFAULT_PROGRESS: LearnProgress = {
  completedTips: [],
  currentStreak: 0,
  lastVisitDate: "",
  totalXp: 0,
  unlockedSections: ["beginner"],
  dailyTipDate: "",
  dailyTipId: "",
};

function toLocalDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayStr(): string {
  return toLocalDateStr(new Date());
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalDateStr(d);
}

export function getLearnProgress(): LearnProgress {
  if (typeof window === "undefined") return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(LEARN_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } as LearnProgress;
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveLearnProgress(progress: LearnProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(progress));
}

export function updateStreak(progress: LearnProgress): LearnProgress {
  const today = todayStr();
  if (progress.lastVisitDate === today) return progress;

  const yesterday = yesterdayStr();
  const newStreak =
    progress.lastVisitDate === yesterday
      ? progress.currentStreak + 1
      : 1;

  const updated: LearnProgress = {
    ...progress,
    currentStreak: newStreak,
    lastVisitDate: today,
    totalXp: progress.totalXp + XP_DAILY_VISIT,
  };
  saveLearnProgress(updated);
  return updated;
}

export type Section = {
  id: string;
  title: string;
  items: readonly (readonly [string, string])[];
};

export const SECTIONS: Section[] = [
  {
    id: "beginner",
    title: "Beginner Basics",
    items: [
      ["Start with 3 values", "Pick light, mid, and dark first so your form reads fast."],
      ["Test before committing", "Do a tiny swatch on scrap paper for every key color."],
      ["Choose good lighting", "Work under daylight or a daylight-balanced lamp to see true colors."],
      ["Start with light colors", "Go from lightest to darkest — you can always go darker, never lighter."],
      ["Use smooth paper", "Marker-grade paper (like Bristol) prevents feathering and bleeding."],
    ],
  },
  {
    id: "blending",
    title: "Blending Techniques",
    items: [
      ["Blend while wet", "Lay the second color before the first one dries for smoother transitions."],
      ["Bridge with a middle tone", "Use a shared in-between marker to remove hard edges."],
      ["Try circular motions", "Small circles give more even coverage than straight strokes."],
      ["Use a colorless blender", "A 0-blender softens edges without adding pigment."],
      ["Layer light to dark", "Build up color in thin layers rather than one heavy pass."],
    ],
  },
  {
    id: "light-shadow",
    title: "Light & Shadow",
    items: [
      ["Choose one light direction", "Keep highlights and cast shadows consistent across the whole piece."],
      ["Push contrast at focal points", "Use your darkest dark near the area you want eyes to land on."],
      ["Use warm and cool contrast", "Warm light means cool shadows — and vice versa."],
      ["Soften edges gradually", "Blend shadow edges so forms look round, not cut-out."],
      ["Leave white highlights", "The paper white is your brightest value — plan where to leave it."],
    ],
  },
  {
    id: "marker-control",
    title: "Marker Control",
    items: [
      ["Use the brush tip side-on", "A light side stroke gives cleaner fills and fewer streaks."],
      ["Work in small sections", "Finish one shape at a time to avoid drying seams."],
      ["Rotate the paper", "Turn the page so strokes follow the form naturally."],
      ["Clean tips regularly", "Wipe your marker tip on scrap paper before switching colors."],
      ["Cap unused markers", "Alcohol evaporates fast — cap markers you're not actively using."],
    ],
  },
  {
    id: "finishing",
    title: "Finishing Touches",
    items: [
      ["Add selective details", "Crisp accents on eyes, edges, or textures make the piece feel finished."],
      ["Rest and review", "Take a short break, then check values before final touch-ups."],
      ["Add white gel pen highlights", "A white gel pen adds pop to reflections and tiny highlights."],
      ["Scan your work", "A high-quality scan captures colors more accurately than a photo."],
      ["Sign your artwork", "Always sign your work — you earned it!"],
    ],
  },
];

export function tipId(sectionId: string, index: number): string {
  return `${sectionId}-${index}`;
}

export function getTotalTipCount(): number {
  return SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
}

export function isSectionUnlocked(sectionId: string, progress: LearnProgress): boolean {
  const idx = SECTIONS.findIndex((s) => s.id === sectionId);
  if (idx <= 0) return true; // First section always unlocked
  const prevSection = SECTIONS[idx - 1];
  return prevSection.items.some((_, i) =>
    progress.completedTips.includes(tipId(prevSection.id, i))
  );
}

export function getSectionProgress(sectionId: string, progress: LearnProgress): number {
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return 0;
  const completed = section.items.filter((_, i) =>
    progress.completedTips.includes(tipId(section.id, i))
  ).length;
  return completed;
}

export function isSectionComplete(sectionId: string, progress: LearnProgress): boolean {
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return false;
  return getSectionProgress(sectionId, progress) === section.items.length;
}

export function isAllComplete(progress: LearnProgress): boolean {
  return SECTIONS.every((section) => isSectionComplete(section.id, progress));
}

export function markTipComplete(id: string, progress: LearnProgress): { progress: LearnProgress; xpGained: number; sectionCompleted: boolean } {
  if (progress.completedTips.includes(id)) {
    return { progress, xpGained: 0, sectionCompleted: false };
  }

  const sectionId = id.split("-").slice(0, -1).join("-");
  const section = SECTIONS.find((s) => s.id === sectionId);
  const newCompleted = [...progress.completedTips, id];

  let xpGained = XP_PER_TIP;
  let sectionCompleted = false;

  if (section) {
    const allComplete = section.items.every((_, i) =>
      newCompleted.includes(tipId(section.id, i))
    );
    if (allComplete) {
      xpGained += XP_SECTION_BONUS;
      sectionCompleted = true;
    }
  }

  const updated: LearnProgress = {
    ...progress,
    completedTips: newCompleted,
    totalXp: progress.totalXp + xpGained,
  };
  saveLearnProgress(updated);
  return { progress: updated, xpGained, sectionCompleted };
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getXpForNextLevel(xp: number): { current: number; needed: number; percent: number } {
  const current = xp % 100;
  const needed = 100;
  return { current, needed, percent: Math.min(current / needed, 1) };
}

// --- Streak milestones ---

export type StreakMilestone = {
  label: string;
  emoji: string;
  reached: boolean;
};

const STREAK_MILESTONES = [
  { days: 3, label: "3 days", emoji: "\uD83D\uDD25" },
  { days: 7, label: "1 week", emoji: "\uD83D\uDD25\uD83D\uDD25" },
  { days: 14, label: "2 weeks", emoji: "\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25" },
  { days: 30, label: "1 month", emoji: "\u2B50" },
  { days: 60, label: "2 months", emoji: "\uD83C\uDFC6" },
  { days: 100, label: "100 days", emoji: "\uD83D\uDC8E" },
] as const;

export function getStreakMilestone(streak: number): { emoji: string; label: string } {
  let milestone = { emoji: "\uD83D\uDD25", label: "" };
  for (const m of STREAK_MILESTONES) {
    if (streak >= m.days) {
      milestone = { emoji: m.emoji, label: m.label };
    }
  }
  return milestone;
}

export function getNextMilestone(streak: number): { days: number; label: string } | null {
  for (const m of STREAK_MILESTONES) {
    if (streak < m.days) {
      return { days: m.days - streak, label: m.label };
    }
  }
  return null;
}

// --- Daily tip with review mode ---

export type DailyTipResult = {
  sectionTitle: string;
  tipIndex: number;
  tipTitle: string;
  tipDesc: string;
  tipFullId: string;
  isReview: boolean;
};

export function getDailyTip(progress: LearnProgress): DailyTipResult | null {
  const today = todayStr();
  const allDone = isAllComplete(progress);

  // If we already picked a tip for today and it's valid, return it
  if (progress.dailyTipDate === today && progress.dailyTipId) {
    for (const section of SECTIONS) {
      for (let i = 0; i < section.items.length; i++) {
        if (tipId(section.id, i) === progress.dailyTipId) {
          return {
            sectionTitle: section.title,
            tipIndex: i,
            tipTitle: section.items[i][0],
            tipDesc: section.items[i][1],
            tipFullId: progress.dailyTipId,
            isReview: allDone,
          };
        }
      }
    }
  }

  // Pick from uncompleted tips first
  const uncompleted: DailyTipResult[] = [];
  for (const section of SECTIONS) {
    for (let i = 0; i < section.items.length; i++) {
      const id = tipId(section.id, i);
      if (!progress.completedTips.includes(id)) {
        uncompleted.push({
          sectionTitle: section.title,
          tipIndex: i,
          tipTitle: section.items[i][0],
          tipDesc: section.items[i][1],
          tipFullId: id,
          isReview: false,
        });
      }
    }
  }

  // If all tips completed, pick a random review tip
  if (uncompleted.length === 0) {
    const allTips: DailyTipResult[] = [];
    for (const section of SECTIONS) {
      for (let i = 0; i < section.items.length; i++) {
        allTips.push({
          sectionTitle: section.title,
          tipIndex: i,
          tipTitle: section.items[i][0],
          tipDesc: section.items[i][1],
          tipFullId: tipId(section.id, i),
          isReview: true,
        });
      }
    }
    if (allTips.length === 0) return null;

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tip = allTips[dayOfYear % allTips.length];

    const updated: LearnProgress = {
      ...progress,
      dailyTipDate: today,
      dailyTipId: tip.tipFullId,
    };
    saveLearnProgress(updated);
    return tip;
  }

  // Use day-of-year as deterministic index
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tip = uncompleted[dayOfYear % uncompleted.length];

  // Save the pick
  const updated: LearnProgress = {
    ...progress,
    dailyTipDate: today,
    dailyTipId: tip.tipFullId,
  };
  saveLearnProgress(updated);

  return tip;
}
