import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SearchBar } from "@/components/layout/SearchBar";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { EmptyState, NoResultsState } from "@/components/ui/States";
import { categoryList } from "@/lib/config";
import { searchProducts } from "@/lib/repositories/catalog.repository";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";
import { sanitizeText } from "@/lib/security/sanitize";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = sanitizeText(raw, 80);

  return buildMetadata({
    title: query ? `Resultados para "${query}"` : "Buscador de productos",
    description: query
      ? `Productos que coinciden con "${query}" en el catálogo de TechCompare.`
      : "Busca celulares, laptops, procesadores y tarjetas gráficas por nombre, marca o componente.",
    path: paths.search(),
    // Las páginas de resultados no aportan valor al índice de búsqueda.
    noIndex: true,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = sanitizeText(raw, 80);
  const hits = query.length >= 2 ? await searchProducts(query, 24) : [];

  return (
    <Container className="pb-16">
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Buscar", path: paths.search() },
        ]}
      />

      <header className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buscar</h1>
        <div className="mt-4">
          <SearchBar size="lg" autoFocus />
        </div>
      </header>

      {query.length < 2 ? (
        <EmptyState
          title="Escribe al menos dos caracteres"
          description="Puedes buscar por modelo, marca, procesador o arquitectura."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {categoryList.map((category) => (
                <ButtonLink
                  key={category.slug}
                  href={paths.category(category.key)}
                  variant="secondary"
                  size="sm"
                >
                  {category.label}
                </ButtonLink>
              ))}
            </div>
          }
        />
      ) : hits.length === 0 ? (
        <NoResultsState
          query={query}
          action={
            <ButtonLink href={paths.category("phone")} variant="secondary" size="sm">
              Ver todos los celulares
            </ButtonLink>
          }
        />
      ) : (
        <Section className="pt-0">
          <p className="mb-4 text-sm text-[var(--ink-muted)]">
            <strong className="text-[var(--ink)] tabular-nums">{hits.length}</strong> resultados
            para &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hits.map((hit, index) => (
              <ProductCard key={hit.product.id} product={hit.product} priority={index < 4} />
            ))}
          </div>
        </Section>
      )}
    </Container>
  );
}
