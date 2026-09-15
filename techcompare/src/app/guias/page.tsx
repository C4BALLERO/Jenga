import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { guides } from "@/data/guides";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Guías de compra de tecnología",
  description:
    "Guías prácticas para elegir celular, laptop, procesador o tarjeta gráfica sin perderte entre especificaciones.",
  path: paths.guides(),
  keywords: ["guía de compra celular", "cómo elegir laptop", "guía procesadores"],
});

export default function GuidesPage() {
  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: "Guías de compra", path: paths.guides() },
  ];

  return (
    <Container className="pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Guías de compra</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Lo que conviene mirar antes de decidir, explicado sin tecnicismos innecesarios y con el
          mercado boliviano en mente.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Card interactive className="h-full">
              <Link href={paths.guide(guide.slug)} className="flex h-full flex-col p-5">
                <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <BookOpen className="size-4" aria-hidden />
                </span>
                <h2 className="text-base font-semibold">{guide.title}</h2>
                <p className="mt-1 flex-1 text-sm text-[var(--ink-muted)]">{guide.description}</p>
                <p className="mt-3 text-xs text-[var(--ink-muted)]">
                  {guide.readingMinutes} min · Actualizada el {formatDate(guide.updated)}
                </p>
              </Link>
            </Card>
          </li>
        ))}
      </ul>

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          itemListSchema(
            "Guías de compra",
            paths.guides(),
            guides.map((guide) => ({ name: guide.title, path: paths.guide(guide.slug) })),
          ),
        ]}
      />
    </Container>
  );
}
