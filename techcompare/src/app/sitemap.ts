import type { MetadataRoute } from "next";
import { guides } from "@/data/guides";
import { suggestComparisons } from "@/lib/compare/compare";
import { categoryList, siteConfig } from "@/lib/config";
import { getCategoryProducts } from "@/lib/repositories/catalog.repository";
import { publishableCollections } from "@/lib/repositories/collections.repository";
import { paths } from "@/lib/seo/paths";

/**
 * Sitemap generado a partir del catálogo real.
 *
 * Solo entran páginas con contenido: los rankings programáticos aparecen
 * únicamente si producen al menos tres resultados, y las comparaciones solo
 * entre equipos de nivel parecido.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = siteConfig.url;

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}${paths.quiz()}`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${base}${paths.calculator()}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${base}${paths.guides()}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  for (const category of categoryList) {
    entries.push({
      url: `${base}${paths.category(category.key)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
    entries.push({
      url: `${base}/comparar/${category.compareSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });

    const products = await getCategoryProducts(category.key);

    for (const product of products) {
      entries.push({
        url: `${base}${paths.product(product.category, product.slug)}`,
        lastModified: new Date(product.provenance.lastUpdated),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const [a, b] of suggestComparisons(products, 12)) {
      entries.push({
        url: `${base}${paths.compare(category.key, [a.slug, b.slug])}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  for (const collection of publishableCollections()) {
    entries.push({
      url: `${base}${paths.collection(collection.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const guide of guides) {
    entries.push({
      url: `${base}${paths.guide(guide.slug)}`,
      lastModified: new Date(guide.updated),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
