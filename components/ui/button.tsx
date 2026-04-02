"use client";

import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
};

export function Button({ className = "", children, variant = "default", ...props }: Props) {
  const styleClass =
    variant === "ghost"
      ? "bg-transparent text-[var(--text)]"
      : "bg-[var(--accent)] text-white";

  return (
    <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${styleClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
