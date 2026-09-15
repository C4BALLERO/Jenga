import Image from "next/image";
import { stableHash } from "@/lib/scoring/math";
import { cn } from "@/lib/utils";
import type { AnyProduct } from "@/types/products";

const CATEGORY_GLYPH: Record<string, string> = {
  phone: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z",
  laptop: "M3 5h18v11H3zM1 19h22",
  cpu: "M6 6h12v12H6z",
  gpu: "M2 7h20v10H2z",
};

/**
 * Imagen de producto.
 *
 * Mientras no haya imágenes oficiales cedidas por fabricante o tienda, se
 * dibuja un marcador SVG determinista con las iniciales de la marca. Es una
 * representación honesta (no simula una foto real), pesa cero bytes de red y no
 * introduce desplazamiento de maquetación.
 */
export function ProductImage({
  product,
  className,
  sizes = "(max-width: 768px) 100vw, 320px",
  priority = false,
}: {
  product: AnyProduct;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (product.image) {
    return (
      <div className={cn("relative aspect-4/3 overflow-hidden rounded-lg bg-[var(--surface-2)]", className)}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-3"
        />
      </div>
    );
  }

  const hue = stableHash(product.brandSlug) % 360;
  const initials = product.brandName.slice(0, 2).toUpperCase();
  const glyph = CATEGORY_GLYPH[product.category] ?? CATEGORY_GLYPH.phone;
  const gradientId = `g-${product.id}`;

  return (
    <div
      className={cn("relative aspect-4/3 overflow-hidden rounded-lg bg-[var(--surface-2)]", className)}
      role="img"
      aria-label={`Marcador de imagen para ${product.name}`}
    >
      <svg viewBox="0 0 120 90" className="size-full" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue} 70% 62%)`} stopOpacity="0.22" />
            <stop offset="100%" stopColor={`hsl(${(hue + 45) % 360} 70% 50%)`} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="120" height="90" fill={`url(#${gradientId})`} />
        <g
          transform="translate(43 26) scale(1.4)"
          fill="none"
          stroke={`hsl(${hue} 55% 45%)`}
          strokeWidth="1.1"
          opacity="0.45"
        >
          <path d={glyph} />
        </g>
        <text
          x="60"
          y="79"
          textAnchor="middle"
          fontSize="8"
          fontWeight="600"
          letterSpacing="1.5"
          fill={`hsl(${hue} 40% 45%)`}
          opacity="0.6"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}
