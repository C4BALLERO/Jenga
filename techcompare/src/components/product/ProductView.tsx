import { ExternalLink, Scale } from "lucide-react";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container, Section } from "@/components/ui/Container";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { categories } from "@/lib/config";
import {
  getOffers,
  getPriceHistory,
  getPriceInsight,
  getRelatedProducts,
} from "@/lib/repositories/catalog.repository";
import { priceInsight } from "@/data/offers";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { paths } from "@/lib/seo/paths";
import type { AnyProduct } from "@/types/products";
import { OfferList } from "./OfferList";
import { PriceDisplay } from "./PriceDisplay";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { ProductCard } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { ProvenanceBadge, ProvenanceNote } from "./ProvenanceBadge";
import { SpecList } from "./SpecList";

const SCORE_LABELS: Record<string, string> = {
  gaming: "Gaming",
  camera: "Cámara",
  battery: "Batería",
  display: "Pantalla",
  productivity: "Productividad",
  portability: "Portabilidad",
  efficiency: "Eficiencia",
  editing: "Edición",
  value: "Calidad-precio",
  p1080: "Juego en 1080p",
  p1440: "Juego en 1440p",
  p4k: "Juego en 4K",
};

export async function ProductView({ product }: { product: AnyProduct }) {
  const config = categories[product.category];
  const [offers, history, related] = await Promise.all([
    getOffers(product.id),
    getPriceHistory(product.id),
    getRelatedProducts(product, 4),
  ]);

  const insight = priceInsight(history) ?? (await getPriceInsight(product.id));

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: config.label, path: paths.category(product.category) },
    { name: product.name, path: paths.product(product.category, product.slug) },
  ];

  const scores = Object.entries(
    (product.specs as unknown as { scores?: Record<string, number> }).scores ?? {},
  ).filter(([key]) => key in SCORE_LABELS);

  const rival = related[0];

  return (
    <Container className="pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div>
          <ProductImage product={product} priority className="mb-4" sizes="(max-width: 1024px) 100vw, 320px" />

          <Card className="p-4">
            <PriceDisplay
              amount={product.referencePrice}
              currency={product.referenceCurrency}
              size="lg"
              emptyLabel="No se vende por separado"
            />
            <p className="mt-1 text-xs text-[var(--ink-muted)]">Precio de referencia orientativo.</p>

            <div className="mt-4 grid gap-2">
              {rival && (
                <ButtonLink
                  href={paths.compare(product.category, [product.slug, rival.slug])}
                  variant="secondary"
                  size="sm"
                >
                  <Scale className="size-4" aria-hidden />
                  Comparar con {rival.model}
                </ButtonLink>
              )}
              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium hover:border-brand-500/50"
                >
                  Ver producto oficial
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              )}
            </div>

            <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
              <ProvenanceNote provenance={product.provenance} />
            </div>
          </Card>

          <AdSlot format="rectangle" slotId="product-sidebar" className="mt-4 hidden lg:block" />
        </div>

        <div className="min-w-0">
          <header>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link
                href={`${paths.category(product.category)}?brand=${encodeURIComponent(product.brandName)}`}
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                {product.brandName}
              </Link>
              <Badge>{product.releaseYear}</Badge>
              <ProvenanceBadge provenance={product.provenance} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--ink-muted)]">{product.description}</p>
          </header>

          {scores.length > 0 && (
            <Card className="mt-6 p-5">
              <h2 className="mb-4 text-base font-semibold">
                Puntuaciones dentro de {config.plural}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {scores.map(([key, value]) => (
                  <ScoreBar key={key} label={SCORE_LABELS[key]} score={value} />
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--ink-muted)]">
                Índices calculados a partir de la ficha técnica y comparables solo dentro de esta
                categoría. No sustituyen a una prueba de uso real.
              </p>
            </Card>
          )}

          <Section title="Ficha técnica" className="pt-8">
            <SpecList product={product} />
          </Section>

          <AdSlot format="in-article" slotId="product-mid" />

          <Section title="Dónde comprarlo" className="pt-4">
            <OfferList offers={offers} />
          </Section>

          <Section title="Evolución del precio" className="pt-4">
            <PriceHistoryChart history={history} insight={insight} />
          </Section>
        </div>
      </div>

      {related.length > 0 && (
        <Section
          title="Alternativas parecidas"
          description="Modelos con precio o rendimiento cercanos, por si quieres contrastar."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </Section>
      )}

      <JsonLd data={[breadcrumbSchema(breadcrumbs), productSchema(product, offers)]} />
    </Container>
  );
}
