"use client";

import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { quizQuestions } from "@/data/quiz-questions";
import { trackRecommendation } from "@/lib/analytics/events";
import { answersToParams, defaultAnswers, type QuizAnswers } from "@/lib/recommend/engine";
import { paths } from "@/lib/seo/paths";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * Cuestionario paso a paso.
 *
 * Al terminar, las respuestas se escriben en la URL: el resultado se calcula en
 * el servidor y el enlace se puede compartir tal cual.
 */
export function QuizForm({ initialAnswers }: { initialAnswers?: QuizAnswers }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers ?? defaultAnswers());
  const [step, setStep] = useState(0);

  const question = quizQuestions[step];
  const total = quizQuestions.length;
  const progress = Math.round(((step + 1) / total) * 100);
  const isLast = step === total - 1;

  const select = (value: string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);

    if (isLast) {
      const params = answersToParams(next);
      params.set("r", "1");
      trackRecommendation(next.budget, next.os);
      router.push(`${paths.quiz()}?${params.toString()}`);
    } else {
      setStep((current) => current + 1);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--ink-muted)]">
          <span>
            Pregunta {step + 1} de {total}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del cuestionario"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <fieldset key={question.id} className="animate-rise">
        <legend className="text-xl font-semibold tracking-tight sm:text-2xl">
          {question.title}
        </legend>
        {question.help && (
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{question.help}</p>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
            const active = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => select(option.value)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-brand-500 bg-brand-500/8 ring-2 ring-brand-500/20"
                    : "border-[var(--border-subtle)] hover:-translate-y-0.5 hover:border-brand-500/50",
                )}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                {option.description && (
                  <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                    {option.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Anterior
        </Button>

        {isLast ? (
          <Button onClick={() => select(answers[question.id])}>
            <Sparkles className="size-4" aria-hidden />
            Ver recomendaciones
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setStep((current) => current + 1)}>
            Siguiente
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
