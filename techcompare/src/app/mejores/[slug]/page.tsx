import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { ProductImage } from "@/components/product/ProductImage";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container, Section } from "@/components/ui/Container";
import { categories } from "@/lib/config";
import {
  getCollectionWithProducts,
  publishableCollections,
} from "@/lib/repositories/collections.repository";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";
import { breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/seo/schema";

// Next exige un literal aquí (ver CATALOG_REVALIDATE en src/lib/config.ts).
export const revalidate = 3600;
export const dynamicParams = false;

/**
 * Solo se generan las colecciones que producen al menos tres resultados reales.
 * Es la salvaguarda contra el SEO programático vacío: si no hay contenido útil,
 * la página no existe.
 */
export function generateStaticParams() {
  return publishableCollections().map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollectionWithProducts(slug);

  if (!data) {
    return buildMetadata({
      title: "Ranking no encontrado",
      description: "Este ranking no existe.",
      path: "/",
      noIndex: true,
    });
  }

  return buildMetadata({
    title: data.collection.title,
    description: data.collection.description,
    path: paths.collection(data.collection.slug),
    keywords: [data.collection.title, data.collection.heading],
    type: "article",
  });
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCollectionWithProducts(slug);
  if (!data || data.ranked.length < 3) notFound();

  const { collection, ranked } = data;
  const config = categories[collection.category];
  const path = paths.collection(collection.slug);

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: config.label, path: paths.category(collection.category) },
    { name: collection.title, path },
  ];

  return (
    <Container className="pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <article>
        <header className="mb-6 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {collection.heading}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{collection.intro}</p>
        </header>

        <Card className="mb-8 p-5">
          <h2 className="mb-3 text-sm font-semibold">Cómo hemos ordenado esta lista</h2>
          <ul className="space-y-1.5 text-sm text-[var(--ink-muted)]">
            {collection.criteria.map((criterion) => (
              <li key={criterion} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                {criterion}
              </li>
            ))}
          </ul>
        </Card>

        <ol className="space-y-4">
          {ranked.map((entry) => (
            <li key={entry.product.id}>
              <Card interactive className="overflow-hidden">
                <Link
                  href={paths.product(entry.product.category, entry.product.slug)}
                  className="grid gap-4 p-5 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto]"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      entry.position === 1
                        ? "bg-brand-600 text-white"
                        : "bg-[var(--surface-2)] text-[var(--ink-muted)]"
                    }`}
                  >
                    {entry.position}
                  </span>

                  <ProductImage product={entry.product} className="w-24 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-xs text-[var(--ink-muted)]">{entry.product.brandName}</p>
                    <h3 className="text-base font-semibold">{entry.product.name}</h3>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{entry.highlight}</p>
                    {entry.position === 1 && (
                      <Badge variant="brand" className="mt-2">
                        Mejor de la lista
                      </Badge>
                    )}
                  </div>

                  <div className="text-right">
                    <PriceDisplay
                      amount={entry.product.referencePrice}
                      currency={entry.product.referenceCurrency}
                    />
                    <p className="mt-1 text-xs text-[var(--ink-muted)] tabular-nums">
                      Puntuación {entry.score}/100
                    </p>
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ol>

        <AdSlot format="in-article" slotId={`collection-${collection.slug}`} className="mt-8" />

        <Section title="Preguntas frecuentes">
          <dl className="space-y-4">
            {collection.faq.map((item) => (
              <div key={item.question} className="rounded-xl border border-[var(--border-subtle)] p-4">
                <dt className="font-semibold">{item.question}</dt>
                <dd className="mt-1 text-sm text-[var(--ink-muted)]">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <p className="mt-6 text-sm">
          <Link
            href={paths.category(collection.category)}
            className="font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            Ver todos los {config.plural} con filtros
          </Link>
        </p>
      </article>

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          itemListSchema(
            collection.heading,
            path,
            ranked.map((entry) => ({
              name: entry.product.name,
              path: paths.product(entry.product.category, entry.product.slug),
            })),
          ),
          faqSchema(collection.faq),
        ]}
      />
    </Container>
  );
}
