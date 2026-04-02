const LABELS: Record<string, string> = {
  beginner: "BEGINNER",
  learning: "LEARNING",
  experienced: "EXPERIENCED",
  pro: "PRO",
};

export function UserBadges({
  skillLevel,
  className = "",
}: {
  skillLevel?: string | null;
  artInterests?: string[];
  className?: string;
}) {
  const key = (skillLevel || "beginner").toLowerCase();
  const label = LABELS[key] || key.toUpperCase();

  return <span className={`inline-flex items-center rounded-full bg-[#FCE7F3] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#9D174D] ${className}`}>{label}</span>;
}
