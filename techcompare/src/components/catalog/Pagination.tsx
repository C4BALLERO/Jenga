import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageHref(basePath: string, params: URLSearchParams, page: number): string {
  const next = new URLSearchParams(params.toString());
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Paginación con enlaces reales para que los buscadores recorran el catálogo. */
export function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }

  const windowSize = 2;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) =>
      candidate === 1 ||
      candidate === totalPages ||
      Math.abs(candidate - page) <= windowSize,
  );

  return (
    <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-1">
      {page > 1 && (
        <Link
          href={pageHref(basePath, params, page - 1)}
          rel="prev"
          aria-label="Página anterior"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-brand-500/50"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      )}

      {pages.map((candidate, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && candidate - previous > 1;

        return (
          <span key={candidate} className="flex items-center gap-1">
            {gap && <span className="px-1 text-[var(--ink-muted)]">…</span>}
            <Link
              href={pageHref(basePath, params, candidate)}
              aria-current={candidate === page ? "page" : undefined}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg border text-sm tabular-nums transition-colors",
                candidate === page
                  ? "border-brand-500 bg-brand-500/10 font-semibold text-brand-600 dark:text-brand-300"
                  : "border-[var(--border-subtle)] hover:border-brand-500/50",
              )}
            >
              {candidate}
            </Link>
          </span>
        );
      })}

      {page < totalPages && (
        <Link
          href={pageHref(basePath, params, page + 1)}
          rel="next"
          aria-label="Página siguiente"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-brand-500/50"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </nav>
  );
}
