import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CatalogSkeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { categories } from "@/lib/config";
import { getCategoryProducts } from "@/lib/repositories/catalog.repository";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";

const CATEGORY = "cpu" as const;

// Next exige un literal aquí (ver CATALOG_REVALIDATE en src/lib/config.ts).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = categories[CATEGORY];
  const products = await getCategoryProducts(CATEGORY);

  return buildMetadata({
    title: config.seoTitle,
    description: `${config.description} ${products.length} modelos con ficha técnica, precios de referencia en bolivianos y comparador lado a lado.`,
    path: paths.category(CATEGORY),
    keywords: [`comparar ${config.plural}`, `mejores ${config.plural}`, `precios ${config.plural} Bolivia`],
  });
}

export default async function CategoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <Suspense
      fallback={
        <Container className="py-10">
          <CatalogSkeleton />
        </Container>
      }
    >
      <CatalogView category={CATEGORY} searchParams={params} />
    </Suspense>
  );
}
