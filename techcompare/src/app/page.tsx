import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { CategoryCards } from "@/components/home/CategoryCards";
import { PopularComparisons } from "@/components/home/PopularComparisons";
import { SearchBar } from "@/components/layout/SearchBar";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { guides } from "@/data/guides";
import { publishableCollections } from "@/lib/repositories/collections.repository";
import { suggestComparisons } from "@/lib/compare/compare";
import {
  getCatalogCounts,
  getCatalogLastUpdated,
  getCategoryProducts,
  getTopProducts,
} from "@/lib/repositories/catalog.repository";
import { paths } from "@/lib/seo/paths";
import { relativeTime } from "@/lib/utils";

// Next exige un literal aquí (ver CATALOG_REVALIDATE en src/lib/config.ts).
export const revalidate = 3600;

export default async function HomePage() {
  const [counts, phones, laptops, lastUpdated] = await Promise.all([
    getCatalogCounts(),
    getCategoryProducts("phone"),
    getCategoryProducts("laptop"),
    getCatalogLastUpdated(),
  ]);

  const trending = await getTopProducts("phone", "popularity", 4);
  const pairs = [
    ...suggestComparisons(phones, 4),
    ...suggestComparisons(laptops, 2),
  ].slice(0, 6);
  const collections = publishableCollections().slice(0, 6);
  const featuredGuides = guides.slice(0, 4);

  return (
    <>
      <section className="border-b border-[var(--border-subtle)] bg-gradient-to-b from-brand-500/8 to-transparent">
        <Container className="py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center animate-rise">
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Encuentra la tecnología que realmente te conviene
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--ink-muted)] sm:text-lg">
              Compara celulares, laptops, procesadores y GPUs antes de comprar.
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar size="lg" />
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <Clock className="size-3.5" aria-hidden />
              Catálogo actualizado <time dateTime={lastUpdated}>{relativeTime(lastUpdated)}</time>
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Section>
          <CategoryCards counts={counts} />
        </Section>

        <AdSlot format="leaderboard" slotId="home-top" className="my-2" />

        <Section
          title="Comparaciones populares"
          description="Duelos entre equipos de nivel parecido, con veredicto generado a partir de la ficha técnica."
        >
          <PopularComparisons pairs={pairs} />
        </Section>

        <Section
          title="Productos más buscados"
          description="Los celulares con más interés dentro del catálogo."
          action={
            <ButtonLink href={paths.category("phone")} variant="ghost" size="sm">
              Ver todos
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        </Section>

        <Section
          title="Rankings y recomendaciones"
          description="Listas ordenadas con un criterio declarado, no un top improvisado."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={paths.collection(collection.slug)}
                  className="group flex h-full flex-col rounded-xl border border-[var(--border-subtle)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50"
                >
                  <h3 className="text-sm font-semibold transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
                    {collection.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-muted)]">
                    {collection.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <AdSlot format="in-feed" slotId="home-mid" className="my-2" />

        <Section
          title="Guías de compra"
          description="Lo que conviene mirar antes de decidir, explicado sin tecnicismos innecesarios."
          action={
            <ButtonLink href={paths.guides()} variant="ghost" size="sm">
              Todas las guías
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {featuredGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={paths.guide(guide.slug)}
                  className="group flex h-full gap-3 rounded-xl border border-[var(--border-subtle)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    <BookOpen className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
                      {guide.title}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                      {guide.description}
                    </span>
                    <span className="mt-2 block text-[11px] text-[var(--ink-muted)]">
                      {guide.readingMinutes} min de lectura
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </Container>
    </>
  );
}
