import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { categories } from "@/lib/config";
import { getCategoryProducts, getProduct } from "@/lib/repositories/catalog.repository";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";
import { sanitizeSlug } from "@/lib/security/sanitize";

const CATEGORY = "laptop" as const;

// Next exige un literal aquí (ver PRICE_REVALIDATE en src/lib/config.ts).
export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getCategoryProducts(CATEGORY);
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const clean = sanitizeSlug(slug);
  const product = clean ? await getProduct(CATEGORY, clean) : null;

  if (!product) {
    return buildMetadata({
      title: "Producto no encontrado",
      description: "Este producto no está en el catálogo de TechCompare.",
      path: paths.category(CATEGORY),
      noIndex: true,
    });
  }

  const config = categories[CATEGORY];

  return buildMetadata({
    title: `${product.name}: ficha técnica, precio y opiniones`,
    description: `${product.description} Compara el ${product.name} con otros ${config.plural} y consulta su precio de referencia en bolivianos.`,
    path: paths.product(CATEGORY, product.slug),
    keywords: [product.name, `${product.name} precio`, `${product.name} ficha técnica`, product.brandName],
    modifiedTime: product.provenance.lastUpdated,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clean = sanitizeSlug(slug);
  const product = clean ? await getProduct(CATEGORY, clean) : null;

  if (!product) notFound();

  return <ProductView product={product} />;
}
