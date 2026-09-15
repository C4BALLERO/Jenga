import { formatPriceWithUsd } from "@/lib/currency/format";
import { cn } from "@/lib/utils";
import type { Currency } from "@/types/common";

export function PriceDisplay({
  amount,
  currency = "BOB",
  size = "md",
  className,
  emptyLabel = "Precio no disponible",
}: {
  amount: number;
  currency?: Currency;
  size?: "sm" | "md" | "lg";
  className?: string;
  emptyLabel?: string;
}) {
  if (!amount || amount <= 0) {
    return <span className={cn("text-sm text-[var(--ink-muted)]", className)}>{emptyLabel}</span>;
  }

  const { primary, secondary } = formatPriceWithUsd(amount, currency);
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <span className={cn("inline-flex flex-col leading-tight", className)}>
      <span className={cn("font-bold tabular-nums", sizes[size])}>{primary}</span>
      {secondary && <span className="text-xs text-[var(--ink-muted)] tabular-nums">{secondary}</span>}
    </span>
  );
}
