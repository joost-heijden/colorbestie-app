"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type MascotBubbleProps = {
  message?: string;
  messages?: string[];
  rotateMs?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  imageSrc?: string;
};

export function MascotBubble({
  message,
  messages,
  rotateMs = 2400,
  size = "md",
  className,
  imageSrc = "/mascot/bubble-mascot.webp",
}: MascotBubbleProps) {
  const list = useMemo(() => {
    const cleaned = (messages ?? []).map((m) => m.trim()).filter(Boolean);
    if (cleaned.length) return cleaned;
    return [message?.trim() || "Ready when you are."];
  }, [message, messages]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.join("|")]);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, rotateMs);
    return () => window.clearInterval(timer);
  }, [list, rotateMs]);

  const current = list[index] || "";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Bubble: all rounded except bottom-right (app-style) */}
      <div className="max-w-[235px] h-[48px] rounded-[22px] rounded-br-[1px] border-2 border-[var(--text)] bg-white px-4 py-1.5 text-[13px] font-medium leading-[1.15] text-[var(--text)] shadow-[0_2px_8px_rgba(15,23,42,0.05)] flex items-center">
        <p className="pr-1 line-clamp-2">{current}</p>
      </div>

      {/* Mascot always on the right */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-white shadow-[0_6px_16px_rgba(244,114,182,0.16)]",
          size === "sm" && "h-16 w-16",
          size === "md" && "h-24 w-24",
          size === "lg" && "h-32 w-32"
        )}
      >
        <Image src={imageSrc} alt="ColorBestie mascot" fill className="object-cover" />
      </div>
    </div>
  );
}

