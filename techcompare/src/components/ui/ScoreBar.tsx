import { cn } from "@/lib/utils";

function toneFor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-brand-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export function ScoreBar({
  label,
  score,
  max = 100,
  className,
  compact = false,
}: {
  label: string;
  score: number;
  max?: number;
  className?: string;
  compact?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className={cn("text-[var(--ink-muted)]", compact ? "text-xs" : "text-sm")}>{label}</span>
        <span className={cn("font-semibold tabular-nums", compact ? "text-xs" : "text-sm")}>
          {Math.round(score)}
          <span className="text-[var(--ink-muted)]">/{max}</span>
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
        role="meter"
        aria-valuenow={Math.round(score)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", toneFor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({ score, label }: { score: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-[var(--surface-2)]" />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-700",
            clamped >= 80 ? "stroke-emerald-500" : clamped >= 60 ? "stroke-brand-500" : "stroke-amber-500",
          )}
        />
      </svg>
      <span className="-mt-11 text-sm font-bold tabular-nums">{Math.round(clamped)}%</span>
      {label && <span className="mt-8 text-xs text-[var(--ink-muted)]">{label}</span>}
    </div>
  );
}
