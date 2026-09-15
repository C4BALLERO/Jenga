import type { ProductCategory, SpecGroup, SpecRow } from "@/types/common";
import type { AnyProduct } from "@/types/products";
import { scoreOf } from "@/lib/repositories/spec-access";
import { joinList } from "@/lib/utils";
import { formatField, readField, SPEC_TABLES } from "./spec-tables";

/**
 * Motor de comparación.
 *
 * Genera la tabla lado a lado y un veredicto redactado a partir de las
 * especificaciones. El texto no es una plantilla fija: se construye con las
 * diferencias que de verdad existen entre los equipos comparados.
 */

export function buildComparisonTable(products: AnyProduct[]): SpecGroup[] {
  if (products.length < 2) return [];
  const category = products[0].category;

  return SPEC_TABLES[category]
    .map((group) => {
      const rows: SpecRow[] = group.fields
        .map((field): SpecRow | null => {
          const values = products.map((product) => readField(product, field));
          const formatted = products.map((product) => formatField(product, field));

          // Se omiten filas en las que ningún producto aporta dato.
          if (formatted.every((value) => value === "—")) return null;

          let winner: number | null = null;
          if (field.better !== "none") {
            const numeric = values.map((value) => (typeof value === "number" ? value : null));
            const present = numeric.filter((value): value is number => value !== null);

            if (present.length === products.length) {
              const target = field.better === "higher" ? Math.max(...present) : Math.min(...present);
              const winners = numeric
                .map((value, index) => (value === target ? index : -1))
                .filter((index) => index >= 0);
              // Si todos empatan no se declara ganador.
              if (winners.length === 1) winner = winners[0];
            }
          }

          return {
            key: field.key,
            label: field.label,
            a: formatted[0],
            b: formatted[1],
            c: formatted[2],
            winner,
            hint: field.hint,
          };
        })
        .filter((row): row is SpecRow => row !== null);

      return { title: group.title, rows };
    })
    .filter((group) => group.rows.length > 0);
}

const DIMENSION_LABELS: Record<string, string> = {
  gaming: "gaming",
  camera: "fotografía",
  battery: "autonomía",
  display: "pantalla",
  productivity: "productividad",
  portability: "portabilidad",
  efficiency: "eficiencia energética",
  value: "relación calidad-precio",
  p1080: "juego en 1080p",
  p1440: "juego en 1440p",
  p4k: "juego en 4K",
  editing: "edición de vídeo",
};

const DIMENSIONS_BY_CATEGORY: Record<ProductCategory, string[]> = {
  phone: ["gaming", "camera", "battery", "display", "value"],
  laptop: ["gaming", "productivity", "portability", "display", "value"],
  cpu: ["gaming", "productivity", "editing", "efficiency", "value"],
  gpu: ["p1080", "p1440", "p4k", "productivity", "value"],
};

export interface DimensionResult {
  key: string;
  label: string;
  values: number[];
  winner: number | null;
}

export interface Verdict {
  /** Índice del producto recomendado de forma general. */
  overallWinner: number;
  dimensions: DimensionResult[];
  /** Párrafos del resumen "¿Cuál es mejor?". */
  paragraphs: string[];
  /** Una frase por producto explicando para quién es la mejor opción. */
  recommendations: { index: number; text: string }[];
}

function winnerOf(values: number[]): number | null {
  const max = Math.max(...values);
  const winners = values.map((value, index) => (value === max ? index : -1)).filter((i) => i >= 0);
  return winners.length === 1 ? winners[0] : null;
}

export function buildVerdict(products: AnyProduct[]): Verdict | null {
  if (products.length < 2) return null;

  const category = products[0].category;
  const dimensions: DimensionResult[] = DIMENSIONS_BY_CATEGORY[category].map((key) => {
    const values = products.map((product) => Math.round(scoreOf(product, key)));
    return { key, label: DIMENSION_LABELS[key] ?? key, values, winner: winnerOf(values) };
  });

  const overallScores = products.map((product, index) => {
    const dimensionAverage =
      dimensions.reduce((sum, dimension) => sum + dimension.values[index], 0) / dimensions.length;
    return product.performanceScore * 0.45 + dimensionAverage * 0.55;
  });

  const overallWinner = overallScores.indexOf(Math.max(...overallScores));
  const winner = products[overallWinner];

  const wins = dimensions.filter((dimension) => dimension.winner === overallWinner);
  const losses = dimensions.filter(
    (dimension) => dimension.winner !== null && dimension.winner !== overallWinner,
  );

  const paragraphs: string[] = [];

  const marginPoints = Math.round(
    overallScores[overallWinner] -
      Math.max(...overallScores.filter((_, index) => index !== overallWinner)),
  );

  paragraphs.push(
    marginPoints >= 8
      ? `En conjunto gana ${winner.name}, con una ventaja clara de ${marginPoints} puntos sobre su rival más cercano en nuestro índice combinado.`
      : `En conjunto gana ${winner.name}, aunque por un margen ajustado de ${Math.max(marginPoints, 1)} punto${marginPoints === 1 ? "" : "s"}: la elección depende de qué priorices.`,
  );

  if (wins.length > 0) {
    paragraphs.push(
      `Destaca especialmente en ${joinList(wins.map((dimension) => dimension.label))}.`,
    );
  }

  if (losses.length > 0) {
    const detail = joinList(
      losses.map(
        (dimension) => `${products[dimension.winner as number].name} en ${dimension.label}`,
      ),
    );
    paragraphs.push(`No lo gana todo: le superan ${detail}.`);
  }

  const priced = products.filter((product) => product.referencePrice > 0);
  if (priced.length === products.length) {
    const cheapest = products.reduce((a, b) => (a.referencePrice <= b.referencePrice ? a : b));
    const gap = Math.round(
      ((winner.referencePrice - cheapest.referencePrice) / cheapest.referencePrice) * 100,
    );
    if (cheapest.id !== winner.id && gap > 0) {
      paragraphs.push(
        `${cheapest.name} cuesta un ${gap}% menos. Si el presupuesto manda, es la compra más sensata aunque ceda rendimiento.`,
      );
    } else if (cheapest.id === winner.id) {
      paragraphs.push(
        `Además es el más barato de la comparación, así que gana también en relación calidad-precio.`,
      );
    }
  }

  const recommendations = products.map((product, index) => {
    const strengths = dimensions
      .filter((dimension) => dimension.winner === index)
      .map((dimension) => dimension.label);

    if (strengths.length === 0) {
      const best = dimensions.reduce((a, b) => (a.values[index] >= b.values[index] ? a : b));
      return {
        index,
        text: `${product.name}: su punto más fuerte es ${best.label}, pero no lidera ninguna categoría en esta comparación.`,
      };
    }

    return {
      index,
      text: `${product.name}: la mejor opción si lo que más valoras es ${joinList(strengths)}.`,
    };
  });

  return { overallWinner, dimensions, paragraphs, recommendations };
}

/** Convierte `iphone-17-vs-galaxy-s26` en `["iphone-17", "galaxy-s26"]`. */
export function parseCompareSlug(slug: string): string[] {
  return slug
    .split("-vs-")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function buildCompareSlug(slugs: string[]): string {
  return slugs.join("-vs-");
}

/** Comparaciones destacadas sugeridas para enlazado interno y SEO. */
export function suggestComparisons(products: AnyProduct[], limit = 6): [AnyProduct, AnyProduct][] {
  const sorted = [...products].sort((a, b) => b.popularity - a.popularity);
  const pairs: [AnyProduct, AnyProduct][] = [];

  for (let i = 0; i < sorted.length && pairs.length < limit; i += 1) {
    for (let j = i + 1; j < sorted.length && pairs.length < limit; j += 1) {
      const gap = Math.abs(sorted[i].performanceScore - sorted[j].performanceScore);
      // Solo tiene sentido comparar equipos de nivel parecido.
      if (gap <= 18) pairs.push([sorted[i], sorted[j]]);
    }
  }

  return pairs;
}
