import { ExternalLink, Store } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/currency/format";
import { convertStatic } from "@/lib/currency/exchange";
import { relativeTime } from "@/lib/utils";
import type { ProductOffer } from "@/types/common";

const AVAILABILITY: Record<
  ProductOffer["availability"],
  { label: string; variant: BadgeVariant }
> = {
  in_stock: { label: "Disponible", variant: "success" },
  out_of_stock: { label: "Agotado", variant: "danger" },
  preorder: { label: "Preventa", variant: "warning" },
  unknown: { label: "Sin confirmar", variant: "neutral" },
};

/**
 * Ofertas del mismo producto en distintas tiendas.
 *
 * El precio se guarda en la moneda original de cada tienda y se convierte a
 * bolivianos solo para mostrarlo, nunca en base de datos.
 */
export function OfferList({ offers }: { offers: ProductOffer[] }) {
  if (offers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--border-subtle)] p-4 text-sm text-[var(--ink-muted)]">
        Todavía no hay ofertas de tiendas para este producto. Aparecerán aquí en cuanto se conecte
        una tienda con catálogo autorizado.
      </p>
    );
  }

  const best = Math.min(...offers.map((offer) => convertStatic(offer.originalPrice, offer.originalCurrency, "BOB")));

  return (
    <ul className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border-subtle)]">
      {offers.map((offer) => {
        const bob = convertStatic(offer.originalPrice, offer.originalCurrency, "BOB");
        const isBest = Math.round(bob) === Math.round(best);
        const availability = AVAILABILITY[offer.availability];

        return (
          <li key={offer.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--ink-muted)]">
              <Store className="size-4" aria-hidden />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {offer.retailer.name}
                {isBest && <Badge variant="success">Mejor precio</Badge>}
                <Badge variant={availability.variant}>{availability.label}</Badge>
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                {offer.shippingNote} · Actualizado{" "}
                <time dateTime={offer.lastUpdated}>{relativeTime(offer.lastUpdated)}</time>
              </p>
            </div>

            <div className="text-right">
              <p className="text-base font-bold tabular-nums">{formatMoney(Math.round(bob), "BOB")}</p>
              {offer.originalCurrency !== "BOB" && (
                <p className="text-xs text-[var(--ink-muted)] tabular-nums">
                  {formatMoney(offer.originalPrice, offer.originalCurrency)} en origen
                </p>
              )}
            </div>

            {offer.productUrl && (
              <a
                href={offer.productUrl}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand-500/50"
              >
                Ver producto
                <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
