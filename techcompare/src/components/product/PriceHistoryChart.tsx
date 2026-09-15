import { TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/currency/format";
import type { PriceInsight } from "@/data/offers";
import type { PriceHistory } from "@/types/common";

/**
 * Evolución de precio dibujada como SVG en el servidor.
 *
 * Se evita a propósito una librería de gráficas: son 12 puntos, y cada
 * kilobyte de JavaScript cuenta en conexiones móviles.
 */
export function PriceHistoryChart({
  history,
  insight,
}: {
  history: PriceHistory;
  insight: PriceInsight | null;
}) {
  if (history.points.length < 2 || !insight) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--border-subtle)] p-4 text-sm text-[var(--ink-muted)]">
        Todavía no hay historial de precios suficiente para este producto.
      </p>
    );
  }

  const width = 600;
  const height = 160;
  const padding = 8;
  const prices = history.points.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const coords = history.points.map((point, index) => {
    const x = padding + (index / (history.points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((point.price - min) / range) * (height - padding * 2);
    return { x, y, point };
  });

  const line = coords.map((coord) => `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`).join(" ");
  const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;
  const falling = insight.changePct <= 0;
  const Trend = falling ? TrendingDown : TrendingUp;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-4">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-[var(--ink-muted)]">Precio actual</p>
          <p className="text-lg font-bold tabular-nums">
            {formatMoney(insight.current, insight.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--ink-muted)]">Mínimo registrado</p>
          <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMoney(insight.lowest, insight.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--ink-muted)]">Variación último mes</p>
          <p
            className={`flex items-center gap-1 text-lg font-bold tabular-nums ${
              falling ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <Trend className="size-4" aria-hidden />
            {insight.changePct > 0 ? "+" : ""}
            {insight.changePct.toFixed(1)}%
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        role="img"
        aria-label={`Evolución del precio: de ${formatMoney(prices[0], insight.currency)} a ${formatMoney(insight.current, insight.currency)}`}
      >
        <defs>
          <linearGradient id="price-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#price-area)" className="text-brand-500" />
        <polyline
          points={line}
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="stroke-brand-500"
        />
        {coords.map((coord, index) => (
          <circle
            key={index}
            cx={coord.x}
            cy={coord.y}
            r={index === coords.length - 1 ? 4 : 2}
            className={index === coords.length - 1 ? "fill-brand-600" : "fill-brand-500/50"}
          >
            <title>{`${new Date(coord.point.timestamp).toLocaleDateString("es-BO", { month: "short", year: "numeric" })}: ${formatMoney(coord.point.price, insight.currency)}`}</title>
          </circle>
        ))}
      </svg>

      <p className="mt-3 text-xs text-[var(--ink-muted)]">
        {insight.vsLowestPct <= 1
          ? "Está en su precio más bajo registrado."
          : `Está un ${insight.vsLowestPct.toFixed(1)}% por encima de su mínimo histórico.`}{" "}
        Media de los últimos 12 meses: {formatMoney(insight.average, insight.currency)}.
      </p>
    </div>
  );
}
