import { Trophy } from "lucide-react";
import type { Verdict } from "@/lib/compare/compare";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import type { AnyProduct } from "@/types/products";

/** Resumen "¿Cuál es mejor?" con el desglose por dimensión. */
export function VerdictCard({
  products,
  verdict,
}: {
  products: AnyProduct[];
  verdict: Verdict;
}) {
  const winner = products[verdict.overallWinner];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-[var(--border-subtle)] bg-brand-500/5 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
          <Trophy className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold">¿Cuál es mejor?</h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Recomendación general: <strong className="text-[var(--ink)]">{winner.name}</strong>
          </p>
        </div>
      </div>

      <div className="space-y-3 p-5 text-sm leading-relaxed">
        {verdict.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="border-t border-[var(--border-subtle)] p-5">
        <h3 className="mb-3 text-sm font-semibold">Quién gana cada apartado</h3>
        <div className="relative overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                <th scope="col" className="pb-2">Apartado</th>
                {products.map((product) => (
                  <th key={product.id} scope="col" className="pb-2 text-center">
                    {product.model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {verdict.dimensions.map((dimension) => (
                <tr key={dimension.key}>
                  <th scope="row" className="py-2 text-left font-medium capitalize text-[var(--ink-muted)]">
                    {dimension.label}
                  </th>
                  {dimension.values.map((value, index) => (
                    <td
                      key={index}
                      className={cn(
                        "py-2 text-center tabular-nums",
                        dimension.winner === index &&
                          "font-semibold text-emerald-700 dark:text-emerald-300",
                      )}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="space-y-2 border-t border-[var(--border-subtle)] p-5 text-sm">
        {verdict.recommendations.map((recommendation) => (
          <li key={recommendation.index} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
            {recommendation.text}
          </li>
        ))}
      </ul>
    </Card>
  );
}
