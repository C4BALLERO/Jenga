import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Section } from "@/components/ui/Container";
import { guideBySlug, guides } from "@/data/guides";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);

  if (!guide) {
    return buildMetadata({
      title: "Guía no encontrada",
      description: "Esta guía no existe.",
      path: paths.guides(),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: paths.guide(guide.slug),
    type: "article",
    publishedTime: guide.updated,
    modifiedTime: guide.updated,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);
  if (!guide) notFound();

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: "Guías de compra", path: paths.guides() },
    { name: guide.title, path: paths.guide(guide.slug) },
  ];

  return (
    <Container size="narrow" className="pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <article>
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {guide.title}
          </h1>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            {guide.readingMinutes} min de lectura · Actualizada el {formatDate(guide.updated)}
          </p>
          <p className="mt-4 text-base leading-relaxed text-[var(--ink-muted)]">{guide.intro}</p>
        </header>

        {guide.sections.map((section, index) => (
          <section key={section.heading} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-3 text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-2 space-y-1.5 text-sm">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            {index === 1 && <AdSlot format="in-article" slotId={`guide-${guide.slug}`} className="mt-6" />}
          </section>
        ))}

        <Section title="Preguntas frecuentes">
          <dl className="space-y-4">
            {guide.faq.map((item) => (
              <div key={item.question} className="rounded-xl border border-[var(--border-subtle)] p-4">
                <dt className="font-semibold">{item.question}</dt>
                <dd className="mt-1 text-sm text-[var(--ink-muted)]">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </article>

      <JsonLd
        data={[
          breadcrumbSchema(breadcrumbs),
          articleSchema({
            title: guide.title,
            description: guide.description,
            path: paths.guide(guide.slug),
            published: guide.updated,
          }),
          faqSchema(guide.faq),
        ]}
      />
    </Container>
  );
}
