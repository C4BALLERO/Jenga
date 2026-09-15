import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { CompareTable } from "@/components/compare/CompareTable";
import { VerdictCard } from "@/components/compare/VerdictCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { ProvenanceBadge } from "@/components/product/ProvenanceBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Section } from "@/components/ui/Container";
import { buildComparisonTable, buildVerdict, parseCompareSlug, suggestComparisons } from "@/lib/compare/compare";
import { categories } from "@/lib/config";
import { getCategoryProducts, getProductsBySlugs } from "@/lib/repositories/catalog.repository";
import { buildMetadata } from "@/lib/seo/metadata";
import { CATEGORY_BY_URL_SEGMENT, paths } from "@/lib/seo/paths";
import { breadcrumbSchema, comparisonSchema, faqSchema } from "@/lib/seo/schema";
import { sanitizeSlug } from "@/lib/security/sanitize";
import type { ProductCategory } from "@/types/common";
import type { AnyProduct } from "@/types/products";

// Next exige un literal aquí (ver CATALOG_REVALIDATE en src/lib/config.ts).
export const revalidate = 3600;
export const dynamicParams = true;

interface CompareParams {
  categoria: string;
  slug: string;
}

/** Pregenera las comparaciones más probables; el resto se rinde bajo demanda. */
export async function generateStaticParams() {
  const params: CompareParams[] = [];

  for (const [segment, category] of Object.entries(CATEGORY_BY_URL_SEGMENT)) {
    const products = await getCategoryProducts(category);
    for (const [a, b] of suggestComparisons(products, 12)) {
      params.push({ categoria: segment, slug: `${a.slug}-vs-${b.slug}` });
    }
  }

  return params;
}

async function resolve(params: CompareParams): Promise<{
  category: ProductCategory;
  products: AnyProduct[];
} | null> {
  const category = CATEGORY_BY_URL_SEGMENT[params.categoria];
  if (!category) return null;

  const slugs = parseCompareSlug(params.slug)
    .map((slug) => sanitizeSlug(slug))
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, 3);

  if (slugs.length < 2) return null;

  const products = await getProductsBySlugs(category, slugs);
  if (products.length < 2) return null;

  return { category, products };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CompareParams>;
}): Promise<Metadata> {
  const resolved = await resolve(await params);

  if (!resolved) {
    return buildMetadata({
      title: "Comparación no disponible",
      description: "No hemos encontrado los productos de esta comparación.",
      path: "/",
      noIndex: true,
    });
  }

  const { category, products } = resolved;
  const names = products.map((product) => product.name);
  const title = `${names.join(" vs ")}: ¿cuál es mejor?`;

  return buildMetadata({
    title,
    description: `Comparativa de ${names.join(" y ")}: ficha técnica lado a lado, puntuaciones por apartado y veredicto sobre cuál conviene más.`,
    path: paths.compare(category, products.map((product) => product.slug)),
    keywords: [...names, `${names[0]} vs ${names[1]}`, "comparativa", "cuál es mejor"],
  });
}

export default async function ComparePage({ params }: { params: Promise<CompareParams> }) {
  const resolved = await resolve(await params);
  if (!resolved) notFound();

  const { category, products } = resolved;
  const config = categories[category];
  const groups = buildComparisonTable(products);
  const verdict = buildVerdict(products);
  const path = paths.compare(category, products.map((product) => product.slug));
  const names = products.map((product) => product.name);

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: config.label, path: paths.category(category) },
    { name: names.join(" vs "), path },
  ];

  const faq = verdict
    ? [
        {
          question: `¿Cuál es mejor, ${names.join(" o ")}?`,
          answer: verdict.paragraphs.join(" "),
        },
        {
          question: `¿En qué se diferencian ${names[0]} y ${names[1]}?`,
          answer: verdict.dimensions
            .filter((dimension) => dimension.winner !== null)
            .map(
              (dimension) =>
                `En ${dimension.label} destaca ${products[dimension.winner as number].name}.`,
            )
            .join(" "),
        },
      ]
    : [];

  const sharedConfidence = products.every(
    (product) => product.provenance.confidence === products[0].provenance.confidence,
  );

  const alternatives = (await getCategoryProducts(category))
    .filter((item) => !products.some((product) => product.id === item.id))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  return (
    <Container className="pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {names.join(" vs ")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ink-muted)]">
          Comparativa completa de {config.plural}: cada fila resalta en verde el mejor valor y el
          resumen explica cuál conviene según lo que priorices.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Si todos los productos comparten nivel de confianza basta una etiqueta. */}
          {sharedConfidence ? (
            <ProvenanceBadge provenance={products[0].provenance} />
          ) : (
            products.map((product) => (
              <ProvenanceBadge key={product.id} provenance={product.provenance} />
            ))
          )}
        </div>
      </header>

      {verdict && (
        <div className="mb-8">
          <VerdictCard products={products} verdict={verdict} />
        </div>
      )}

      <AdSlot format="in-article" slotId="compare-mid" className="mb-8" />

      <Section title="Tabla comparativa" className="pt-0">
        <div className="rounded-xl border border-[var(--border-subtle)] p-2 sm:p-4">
          <CompareTable products={products} groups={groups} winnerIndex={verdict?.overallWinner} />
        </div>
      </Section>

      {faq.length > 0 && (
        <Section title="Preguntas frecuentes">
          <dl className="space-y-4">
            {faq.map((item) => (
              <div key={item.question} className="rounded-xl border border-[var(--border-subtle)] p-4">
                <dt className="font-semibold">{item.question}</dt>
                <dd className="mt-1 text-sm text-[var(--ink-muted)]">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {alternatives.length > 0 && (
        <Section
          title="Otras opciones a considerar"
          description={`Más ${config.plural} populares que quizá encajen mejor.`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alternatives.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      )}

      <p className="mt-8 text-sm">
        <Link
          href={paths.category(category)}
          className="font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          Comparar otros {config.plural}
        </Link>
      </p>

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          comparisonSchema(products, path),
          ...(faq.length > 0 ? [faqSchema(faq)] : []),
        ]}
      />
    </Container>
  );
}
