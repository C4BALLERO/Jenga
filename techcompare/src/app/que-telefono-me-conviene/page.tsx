import { RotateCcw, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { ProductImage } from "@/components/product/ProductImage";
import { QuizForm } from "@/components/quiz/QuizForm";
import { ShareResult } from "@/components/quiz/ShareResult";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container, Section } from "@/components/ui/Container";
import { ScoreBar, ScoreRing } from "@/components/ui/ScoreBar";
import { quizQuestions } from "@/data/quiz-questions";
import { parseAnswers, recommendPhones, summarizeAnswers } from "@/lib/recommend/engine";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/seo/paths";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = buildMetadata({
  title: "¿Qué teléfono me conviene? Recomendador personalizado",
  description:
    "Responde once preguntas sobre presupuesto, uso, cámara y batería y descubre qué celular encaja contigo, con puntuación de compatibilidad y motivos explicados.",
  path: paths.quiz(),
  keywords: [
    "qué teléfono comprar",
    "recomendador de celulares",
    "qué celular me conviene",
    "mejor celular para mí",
  ],
});

const FAQ = [
  {
    question: "¿Cómo se calcula la compatibilidad?",
    answer:
      "Se pondera cada especificación según la importancia que le has dado: la mitad de la nota viene de las prestaciones que priorizaste, y el resto del ajuste al presupuesto, al almacenamiento y al tamaño de pantalla.",
  },
  {
    question: "¿Puedo compartir mi resultado?",
    answer:
      "Sí. Las respuestas quedan guardadas en la dirección de la página, así que basta con copiar el enlace para que otra persona vea exactamente la misma recomendación.",
  },
  {
    question: "¿Los precios son definitivos?",
    answer:
      "No. Son precios de referencia orientativos en bolivianos. El precio real depende de la tienda, de la importación y del momento de compra.",
  },
];

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }

  const showResults = flat.r === "1";
  const answers = parseAnswers(flat);
  const recommendations = showResults ? recommendPhones(answers, 5) : [];

  const breadcrumbs = [
    { name: "Inicio", path: "/" },
    { name: "¿Qué teléfono me conviene?", path: paths.quiz() },
  ];

  return (
    <Container className="pb-16">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          ¿Qué teléfono me conviene?
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {showResults
            ? `Recomendaciones para: ${summarizeAnswers(answers)}.`
            : `Once preguntas rápidas y te decimos qué celular encaja con lo que de verdad usas. Sin registro.`}
        </p>
      </header>

      {!showResults ? (
        <QuizForm initialAnswers={answers} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <ShareResult />
            <ButtonLink href={paths.quiz()} variant="ghost" size="sm">
              <RotateCcw className="size-4" aria-hidden />
              Volver a empezar
            </ButtonLink>
          </div>

          {recommendations.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm">
                No hemos encontrado ningún equipo que cumpla todos tus requisitos.{" "}
                <Link href={paths.quiz()} className="font-medium text-brand-600 hover:underline">
                  Prueba a ampliar el presupuesto
                </Link>
                .
              </p>
            </Card>
          ) : (
            <ol className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <li key={recommendation.phone.id}>
                  <Card className="overflow-hidden">
                    <div className="grid gap-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                      <div className="flex items-start gap-4">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <ProductImage product={recommendation.phone} className="w-24 shrink-0" />
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={paths.product("phone", recommendation.phone.slug)}
                          className="text-lg font-semibold hover:text-brand-600 dark:hover:text-brand-300"
                        >
                          {recommendation.phone.name}
                        </Link>
                        <PriceDisplay
                          amount={recommendation.phone.referencePrice}
                          currency={recommendation.phone.referenceCurrency}
                          className="mt-1"
                        />

                        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                          <Sparkles className="size-3.5 text-brand-600" aria-hidden />
                          Te recomendamos este teléfono porque
                        </p>
                        <ul className="mt-1.5 space-y-1 text-sm">
                          {recommendation.reasons.map((reason) => (
                            <li key={reason} className="flex gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                              {reason}
                            </li>
                          ))}
                        </ul>

                        {recommendation.caveats.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm text-[var(--ink-muted)]">
                            {recommendation.caveats.map((caveat) => (
                              <li key={caveat} className="flex gap-2">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                                {caveat}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="sm:w-44">
                        <ScoreRing score={recommendation.compatibility} label="Compatibilidad" />
                        <div className="mt-3 space-y-2">
                          {recommendation.breakdown.map((item) => (
                            <ScoreBar key={item.label} label={item.label} score={item.score} compact />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          )}

          <AdSlot format="in-article" slotId="quiz-results" className="mt-8" />

          <Section title="Tus respuestas">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quizQuestions.map((question) => {
                const value = answers[question.id];
                const option = question.options.find((item) => item.value === value);
                return (
                  <div
                    key={question.id}
                    className="rounded-lg border border-[var(--border-subtle)] p-3"
                  >
                    <dt className="text-xs text-[var(--ink-muted)]">{question.title}</dt>
                    <dd className="mt-0.5 text-sm font-medium">{option?.label ?? value}</dd>
                  </div>
                );
              })}
            </dl>
          </Section>
        </>
      )}

      <Section title="Preguntas frecuentes">
        <dl className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.question} className="rounded-xl border border-[var(--border-subtle)] p-4">
              <dt className="font-semibold">{item.question}</dt>
              <dd className="mt-1 text-sm text-[var(--ink-muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <JsonLd data={[breadcrumbSchema(breadcrumbs), faqSchema(FAQ)]} />
    </Container>
  );
}
