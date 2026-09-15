import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export interface SeoInput {
  title: string;
  description: string;
  /** Ruta absoluta del sitio, empezando por "/". */
  path: string;
  keywords?: string[];
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function canonicalUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean === "/" ? "" : clean}`;
}

/** Imagen Open Graph generada por la propia aplicación. */
export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return `${siteConfig.url}/api/og?${params.toString()}`;
}

/**
 * Constructor único de metadata. Todas las páginas lo usan para garantizar
 * canonical, Open Graph y Twitter Cards coherentes en todo el sitio.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  images,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: SeoInput): Metadata {
  const url = canonicalUrl(path);
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const ogImages = images?.length ? images : [ogImageUrl(title, description.slice(0, 90))];

  return {
    title: fullTitle,
    description,
    keywords: [...siteConfig.keywords, ...(keywords ?? [])],
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    openGraph: {
      type,
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      locale: siteConfig.locale,
      images: ogImages.map((image) => ({ url: image, width: 1200, height: 630, alt: title })),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: siteConfig.twitter,
      images: ogImages,
    },
  };
}
