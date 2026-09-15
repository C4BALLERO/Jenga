import Link from "next/link";
import { categories } from "@/lib/config";
import { specString, specValue } from "@/lib/repositories/spec-access";
import { paths } from "@/lib/seo/paths";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { AnyProduct, ProductCategory } from "@/types/products";
import { PriceDisplay } from "./PriceDisplay";
import { ProductImage } from "./ProductImage";

/** Tres datos por categoría: los que de verdad deciden una compra de un vistazo. */
const HIGHLIGHTS: Record<ProductCategory, { key: string; label: string; unit?: string }[]> = {
  phone: [
    { key: "ram", label: "RAM", unit: "GB" },
    { key: "storage", label: "Almacenamiento", unit: "GB" },
    { key: "battery", label: "Batería", unit: "mAh" },
  ],
  laptop: [
    { key: "ram", label: "RAM", unit: "GB" },
    { key: "storage", label: "SSD", unit: "GB" },
    { key: "screenSize", label: "Pantalla", unit: '"' },
  ],
  cpu: [
    { key: "cores", label: "Núcleos" },
    { key: "threads", label: "Hilos" },
    { key: "boostClock", label: "Turbo", unit: "GHz" },
  ],
  gpu: [
    { key: "vram", label: "VRAM", unit: "GB" },
    { key: "shaders", label: "Shaders" },
    { key: "tdp", label: "Consumo", unit: "W" },
  ],
};

export function ProductCard({
  product,
  priority = false,
  action,
  className,
}: {
  product: AnyProduct;
  priority?: boolean;
  action?: React.ReactNode;
  className?: string;
}) {
  const category = categories[product.category];
  const subtitle =
    specString(product, "chipset") ??
    specString(product, "cpu") ??
    specString(product, "architecture") ??
    product.brandName;

  return (
    <Card as="article" interactive className={cn("group flex flex-col overflow-hidden", className)}>
      <Link
        href={paths.product(product.category, product.slug)}
        className="flex flex-1 flex-col p-4 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <ProductImage product={product} priority={priority} className="mb-3" />

        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
            {product.brandName}
          </span>
          {product.releaseYear >= 2025 && (
            <Badge variant="brand" className="px-1.5 py-0 text-[10px]">
              {product.releaseYear}
            </Badge>
          )}
        </div>

        <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
          {product.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ink-muted)]">{subtitle}</p>

        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3">
          {HIGHLIGHTS[product.category].map((highlight) => {
            const value = specValue(product, highlight.key);
            return (
              <div key={highlight.key} className="min-w-0">
                <dt className="truncate text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
                  {highlight.label}
                </dt>
                <dd className="truncate text-xs font-semibold tabular-nums">
                  {typeof value === "number"
                    ? `${value}${highlight.unit ? ` ${highlight.unit}` : ""}`
                    : "—"}
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-3 flex items-end justify-between gap-2 pt-1">
          <PriceDisplay
            amount={product.referencePrice}
            currency={product.referenceCurrency}
            emptyLabel="No se vende por separado"
          />
          <span
            className="shrink-0 text-xs text-[var(--ink-muted)]"
            title={`Índice de rendimiento dentro de ${category.plural}`}
          >
            Rendimiento{" "}
            <span className="font-semibold text-[var(--ink)] tabular-nums">
              {product.performanceScore}
            </span>
          </span>
        </div>
      </Link>

      {action && <div className="border-t border-[var(--border-subtle)] p-3">{action}</div>}
    </Card>
  );
}
