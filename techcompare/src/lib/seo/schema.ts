import { siteConfig } from "@/lib/config";
import { canonicalUrl } from "./metadata";
import type { ProductOffer } from "@/types/common";
import type { AnyProduct } from "@/types/products";

/**
 * Generadores de datos estructurados schema.org.
 *
 * Regla del proyecto: no se declara como confirmado un dato que no lo está. Los
 * productos del catálogo inicial llevan `confidence: "demo"` y por eso NO se
 * emite `Offer` con precio para ellos: un precio inventado en schema.org es
 * exactamente el tipo de dato que penaliza Google.
 */

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: `${siteConfig.url}/icon.svg`,
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.lang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function propertyValues(product: AnyProduct): JsonLd[] {
  const specs = product.specs as unknown as Record<string, unknown>;
  return Object.entries(specs)
    .filter(([key, value]) => key !== "scores" && (typeof value === "string" || typeof value === "number"))
    .slice(0, 20)
    .map(([key, value]) => ({ "@type": "PropertyValue", name: key, value: String(value) }));
}

export function productSchema(product: AnyProduct, offers: ProductOffer[] = []): JsonLd {
  const verified = product.provenance.confidence !== "demo";

  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brandName },
    category: product.category,
    url: canonicalUrl(`/${product.category}/${product.slug}`),
    additionalProperty: propertyValues(product),
  };

  // Solo se publican ofertas con precio cuando provienen de una fuente real.
  if (verified && offers.length > 0) {
    const prices = offers.map((offer) => offer.originalPrice);
    schema.offers = {
      "@type": "AggregateOffer",
      priceCurrency: offers[0].originalCurrency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: offers.length,
      availability:
        offers.some((offer) => offer.availability === "in_stock")
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    };
  }

  return schema;
}

export function comparisonSchema(products: AnyProduct[], path: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: products.map((product) => product.name).join(" vs "),
    url: canonicalUrl(path),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: canonicalUrl(`/${product.category}/${product.slug}`),
    })),
  };
}

export function itemListSchema(
  name: string,
  path: string,
  items: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: canonicalUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: canonicalUrl(item.path),
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  published: string;
  modified?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    datePublished: input.published,
    dateModified: input.modified ?? input.published,
    inLanguage: siteConfig.lang,
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
}
