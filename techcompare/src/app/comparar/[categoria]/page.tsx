import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PopularComparisons } from "@/components/home/PopularComparisons";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Section } from "@/components/ui/Container";
import { suggestComparisons } from "@/lib/compare/compare";
import { categories } from "@/lib/config";
import { getCategoryProducts } from "@/lib/repositories/catalog.repository";
import { buildMetadata } from "@/lib/seo/metadata";
import { CATEGORY_BY_URL_SEGMENT, paths } from "@/lib/seo/paths";
import { breadcrumbSchema } from "@/lib/seo/schema";

// Next exige un literal aquí (ver CATALOG_REVALIDATE en src/lib/config.ts).
export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(CATEGORY_BY_URL_SEGMENT).map((categoria) => ({ categoria }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const category = CATEGORY_BY_URL_SEGMENT[categoria];

  if (!category) {
    return buildMetadata({
      title: "Comparador no encontrado",
      description: "Esta sección no existe.",
      path: "/",
      noIndex: true,
    });
  }

  const config = categories[category];

  return buildMetadata({
    title: `Comparaciones de ${config.plural}`,
    description: `Comparativas destacadas de ${config.plural} entre equipos de nivel parecido, con veredicto y tabla lado a lado.`,
    path: `/comparar/${categoria}`,
  });
}

export default async function CompareIndexPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = CATEGORY_BY_URL_SEGMENT[categoria];
  if (!category) notFound();

  const config = categories[category];
  const products = await getCategoryProducts(category);
  const pairs = suggestComparisons(products, 18);

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: config.label, path: paths.category(category) },
    { name: "Comparaciones", path: `/comparar/${categoria}` },
  ];

  return (
    <Container className="pb-16">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Comparaciones de {config.plural}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--ink-muted)]">
          Solo enfrentamos equipos con un nivel de rendimiento parecido: comparar una gama de
          entrada con un tope de gama no ayuda a decidir.
        </p>
      </header>

      <Section className="pt-0">
        <PopularComparisons pairs={pairs} />
      </Section>

      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
    </Container>
  );
}
