import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { StorageCalculator } from "@/components/calculator/StorageCalculator";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Section } from "@/components/ui/Container";
import { parseStorageInput } from "@/lib/calculator/storage";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de almacenamiento: ¿128, 256, 512 GB o 1 TB?",
  description:
    "Calcula cuánto almacenamiento necesita tu próximo celular según tus fotos, vídeos, juegos y años de uso. Te decimos cuánto espacio libre te quedaría con cada capacidad.",
  path: paths.calculator(),
  keywords: [
    "cuánto almacenamiento necesito",
    "128 o 256 GB",
    "calculadora almacenamiento celular",
    "cuánto espacio ocupa un vídeo 4K",
  ],
});

const FAQ = [
  {
    question: "¿Por qué mi teléfono de 128 GB muestra menos espacio?",
    answer:
      "Por dos motivos que se suman: el fabricante cuenta en gigabytes decimales, así que 128 GB anunciados son unos 119 GB reales, y el sistema operativo con sus cachés se queda alrededor de 20 GB más.",
  },
  {
    question: "¿Cuánto ocupa un minuto de vídeo?",
    answer:
      "Depende de la calidad: en torno a 90 MB por minuto en 1080p a 30 fps y hasta unos 600 MB por minuto en 4K a 60 fps. Grabar en 4K multiplica por seis el espacio necesario.",
  },
  {
    question: "¿La nube me permite comprar menos almacenamiento?",
    answer:
      "Ayuda con fotos y vídeos antiguos, pero las aplicaciones, los juegos y la carpeta de mensajería siguen ocupando espacio local. Conviene tratarla como complemento, no como sustituto.",
  },
];

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }

  const initialInput = parseStorageInput(flat);

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: "Calculadora de almacenamiento", path: paths.calculator() },
  ];

  return (
    <Container className="pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Calculadora de almacenamiento
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Ajusta los controles según cómo usas el teléfono y te decimos qué capacidad te conviene y
          cuánto espacio libre te quedaría. El almacenamiento es la decisión más difícil de corregir
          después.
        </p>
      </header>

      <StorageCalculator initialInput={initialInput} />

      <AdSlot format="in-article" slotId="calculator-bottom" className="mt-8" />

      <Section title="Preguntas frecuentes">
        <dl className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.question} className="rounded-xl border border-[var(--border-subtle)] p-4">
              <dt className="font-semibold">{item.question}</dt>
              <dd className="mt-1 text-sm text-[var(--ink-muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm">
          ¿Ya sabes qué capacidad necesitas?{" "}
          <Link
            href={`${paths.category("phone")}?storage_min=256`}
            className="font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            Filtra celulares por almacenamiento
          </Link>{" "}
          o lee la{" "}
          <Link
            href={paths.guide("cuanto-almacenamiento-necesito")}
            className="font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            guía completa
          </Link>
          .
        </p>
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs), faqSchema(FAQ)]} />
    </Container>
  );
}
