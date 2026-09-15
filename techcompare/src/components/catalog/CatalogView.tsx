import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/States";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionsForCategory } from "@/data/collections";
import {
  activeFilterChips,
  countActiveFilters,
  parseCatalogQuery,
  type RawSearchParams,
} from "@/lib/catalog/query-params";
import { categories } from "@/lib/config";
import { getFacets, queryCatalog } from "@/lib/repositories/catalog.repository";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";
import { paths } from "@/lib/seo/paths";
import type { ProductCategory } from "@/types/common";
import { ActiveFilters } from "./ActiveFilters";
import { CompareToggle } from "./CompareToggle";
import { CompareTray } from "./CompareTray";
import { FilterPanel } from "./FilterPanel";
import { Pagination } from "./Pagination";
import { SortSelect } from "./SortSelect";
import Link from "next/link";

/**
 * Vista de catálogo compartida por las cuatro categorías.
 *
 * Se renderiza en el servidor: el navegador recibe HTML con los productos ya
 * filtrados, y solo los controles (filtros, orden, selección de comparación)
 * son componentes de cliente.
 */
export async function CatalogView({
  category,
  searchParams,
}: {
  category: ProductCategory;
  searchParams: RawSearchParams;
}) {
  const config = categories[category];
  const query = parseCatalogQuery(searchParams, category);
  const [result, facets] = await Promise.all([queryCatalog(query), getFacets(category)]);

  const chips = activeFilterChips(searchParams, category);
  const activeCount = countActiveFilters(query);
  const basePath = paths.category(category);
  const collections = collectionsForCategory(category);

  const labels = Object.fromEntries(result.items.map((product) => [product.slug, product.name]));

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: config.label, path: basePath },
  ];

  return (
    <Container className="pb-24">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Comparar {config.plural}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ink-muted)]">{config.description}</p>
      </header>

      {collections.length > 0 && (
        <nav aria-label="Rankings destacados" className="mb-6 flex flex-wrap gap-2">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={paths.collection(collection.slug)}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand-500/50 hover:text-brand-600 dark:hover:text-brand-300"
            >
              {collection.title}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <FilterPanel facets={facets} activeCount={activeCount} resultCount={result.total} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--ink-muted)]">
              <strong className="text-[var(--ink)] tabular-nums">{result.total}</strong>{" "}
              {result.total === 1 ? config.singular : config.plural}
              {activeCount > 0 ? " con estos filtros" : " en el catálogo"}
            </p>
            <SortSelect />
          </div>

          <ActiveFilters chips={chips} />

          {result.items.length === 0 ? (
            <EmptyState
              title="Ningún producto cumple estos filtros"
              description="Prueba a ampliar el rango de precio o a quitar alguna restricción."
              action={
                <ButtonLink href={basePath} variant="secondary" size="sm">
                  Quitar todos los filtros
                </ButtonLink>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 3}
                    action={<CompareToggle slug={product.slug} name={product.name} />}
                  />
                ))}
              </div>

              <AdSlot format="in-feed" slotId={`catalog-${category}`} className="mt-6" />

              <Pagination
                basePath={basePath}
                searchParams={searchParams}
                page={result.page}
                totalPages={result.totalPages}
              />
            </>
          )}
        </div>
      </div>

      <CompareTray
        category={category}
        compareBasePath={`/comparar/${config.compareSlug}`}
        labels={labels}
      />

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          itemListSchema(
            `Comparar ${config.plural}`,
            basePath,
            result.items.map((product) => ({
              name: product.name,
              path: paths.product(product.category, product.slug),
            })),
          ),
        ]}
      />
    </Container>
  );
}
