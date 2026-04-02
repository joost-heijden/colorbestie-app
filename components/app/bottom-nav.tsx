"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Image, BookOpen, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useColorBestie } from "@/components/app/colorbestie-provider";
import { labels } from "@/lib/ui-language";

type Tab = {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: (pathname: string) => boolean;
};

export function BottomNav() {
  const pathname = usePathname();
  const { uiLanguage } = useColorBestie();
  const l = labels(uiLanguage).nav;

  const tabs: Tab[] = [
    {
      href: "/app",
      icon: Home,
      label: l.home,
      isActive: (p) => p === "/app",
    },
    {
      href: "/app/upload",
      icon: PlusCircle,
      label: l.create,
      isActive: (p) => p.startsWith("/app/upload") || p.startsWith("/app/preview"),
    },
    {
      href: "/app/gallery",
      icon: Image,
      label: l.gallery,
      isActive: (p) => p.startsWith("/app/gallery"),
    },
    {
      href: "/app/learn",
      icon: BookOpen,
      label: l.learn,
      isActive: (p) => p.startsWith("/app/learn"),
    },
    {
      href: "/app/profile",
      icon: User,
      label: l.profile,
      isActive: (p) => p.startsWith("/app/profile"),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-2 md:max-w-2xl">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors",
                active
                  ? "text-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon className={cn("h-5 w-5 md:h-6 md:w-6", active && "stroke-[2.5]")} />
              <span
                className={cn(
                  "text-[10px] md:text-xs",
                  active ? "font-bold" : "font-medium"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
