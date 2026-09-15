import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const VARIANTS = {
  neutral: "bg-[var(--surface-2)] text-[var(--ink-muted)] border-[var(--border-subtle)]",
  brand: "bg-brand-500/10 text-brand-700 border-brand-500/25 dark:text-brand-300",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300",
  danger: "bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export function Badge({
  children,
  variant = "neutral",
  className,
  title,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
