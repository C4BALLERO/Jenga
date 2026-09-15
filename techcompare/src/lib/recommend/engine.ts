import { phones } from "@/data/catalog";
import { quizQuestions, type QuizQuestionId } from "@/data/quiz-questions";
import { clamp, round, scale } from "@/lib/scoring/math";
import type { Phone } from "@/types/products";

export type QuizAnswers = Record<QuizQuestionId, string>;

export interface RecommendationBreakdown {
  label: string;
  score: number;
}

export interface Recommendation {
  phone: Phone;
  /** Compatibilidad global 0-100. */
  compatibility: number;
  breakdown: RecommendationBreakdown[];
  reasons: string[];
  /** Motivos por los que el equipo no encaja del todo. */
  caveats: string[];
}

export function defaultAnswers(): QuizAnswers {
  return Object.fromEntries(
    quizQuestions.map((question) => [question.id, question.defaultValue]),
  ) as QuizAnswers;
}

/** Normaliza respuestas recibidas de la URL, descartando valores no válidos. */
export function parseAnswers(input: Record<string, string | undefined>): QuizAnswers {
  const answers = defaultAnswers();

  for (const question of quizQuestions) {
    const raw = input[question.param] ?? input[question.id];
    if (!raw) continue;
    if (question.options.some((option) => option.value === raw)) {
      answers[question.id] = raw;
    }
  }

  return answers;
}

/** Serializa las respuestas a parámetros cortos para una URL compartible. */
export function answersToParams(answers: QuizAnswers): URLSearchParams {
  const params = new URLSearchParams();
  for (const question of quizQuestions) {
    params.set(question.param, answers[question.id]);
  }
  return params;
}

const importance = (value: string) => clamp(Number(value) || 0, 0, 3) / 3;

function priceFit(price: number, budget: number): number {
  if (price <= 0) return 0;
  if (price > budget) {
    // Penalización progresiva: un 10% por encima aún es aceptable.
    const overshoot = (price - budget) / budget;
    return clamp(100 - overshoot * 420);
  }
  // Dentro de presupuesto: mejor cuanto más aprovecha el rango sin agotarlo.
  return clamp(70 + scale(price, budget * 0.35, budget * 0.95) * 0.3);
}

export function recommendPhones(answers: QuizAnswers, limit = 5): Recommendation[] {
  const budget = Number(answers.budget) || 4000;
  const minStorage = Number(answers.storage) || 128;

  const weights = {
    gaming: 0.4 + importance(answers.gaming) * 1.6,
    camera: 0.4 + importance(answers.photography) * 1.6,
    battery: 0.4 + importance(answers.battery) * 1.6,
    display: 0.4 + importance(answers.social) * 1.2,
    productivity: 0.3 + importance(answers.work) * 1.4,
  };

  const useBoost: Record<string, Partial<Record<keyof typeof weights, number>>> = {
    gaming: { gaming: 0.8 },
    photo: { camera: 0.8 },
    social: { display: 0.6, battery: 0.3 },
    work: { productivity: 0.8, battery: 0.3 },
    mixed: {},
  };

  for (const [key, boost] of Object.entries(useBoost[answers.mainUse] ?? {})) {
    weights[key as keyof typeof weights] += boost as number;
  }

  const candidates = phones.filter((phone) => {
    if (answers.os !== "any" && phone.specs.os !== answers.os) return false;
    if (answers.network === "yes" && !phone.specs.fiveG) return false;
    // Se admite hasta un 25% por encima del presupuesto para no ocultar opciones.
    if (phone.referencePrice > budget * 1.25) return false;
    return true;
  });

  const pool = candidates.length > 0 ? candidates : phones;

  const scored = pool.map((phone): Recommendation => {
    const scores = phone.specs.scores;
    const price = priceFit(phone.referencePrice, budget);

    const screenFit =
      answers.screen === "compact"
        ? clamp(100 - Math.max(0, phone.specs.screenSize - 6.4) * 90)
        : answers.screen === "large"
          ? clamp(100 - Math.max(0, 6.6 - phone.specs.screenSize) * 90)
          : 85;

    const storageFit = phone.specs.storage >= minStorage ? 100 : clamp(60 - (minStorage - phone.specs.storage) / 8);

    const weightedSum =
      scores.gaming * weights.gaming +
      scores.camera * weights.camera +
      scores.battery * weights.battery +
      scores.display * weights.display +
      scores.productivity * weights.productivity;

    const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
    const specScore = weightedSum / weightTotal;

    const compatibility = round(
      clamp(specScore * 0.5 + price * 0.28 + storageFit * 0.12 + screenFit * 0.1),
    );

    const breakdown: RecommendationBreakdown[] = [
      { label: "Gaming", score: round(scores.gaming) },
      { label: "Cámara", score: round(scores.camera) },
      { label: "Batería", score: round(scores.battery) },
      { label: "Pantalla", score: round(scores.display) },
      { label: "Precio", score: round(price) },
    ];

    const reasons: string[] = [];
    const caveats: string[] = [];

    if (phone.referencePrice <= budget) {
      reasons.push(`Entra en tu presupuesto de ${budget.toLocaleString("es-BO")} Bs.`);
    } else {
      caveats.push(
        `Se pasa de tu presupuesto en ${Math.round(phone.referencePrice - budget).toLocaleString("es-BO")} Bs.`,
      );
    }

    if (importance(answers.gaming) >= 0.6 && scores.gaming >= 75) {
      reasons.push(`Su ${phone.specs.chipset} y los ${phone.specs.refreshRate} Hz de pantalla rinden bien en juegos.`);
    }
    if (importance(answers.photography) >= 0.6 && scores.camera >= 70) {
      reasons.push(`Cámara principal de ${phone.specs.mainCamera} MP con ${phone.specs.cameraCount} sensores.`);
    }
    if (importance(answers.battery) >= 0.6 && scores.battery >= 70) {
      reasons.push(`Batería de ${phone.specs.battery} mAh con carga de ${phone.specs.fastCharge} W.`);
    }
    if (importance(answers.work) >= 0.6 && phone.specs.ram >= 8) {
      reasons.push(`${phone.specs.ram} GB de RAM para multitarea sin recargas constantes.`);
    }

    if (phone.specs.storage < minStorage) {
      caveats.push(`Ofrece ${phone.specs.storage} GB y pediste al menos ${minStorage} GB.`);
    }
    if (answers.screen === "compact" && phone.specs.screenSize > 6.5) {
      caveats.push(`Con ${phone.specs.screenSize}" no es precisamente compacto.`);
    }
    if (answers.network === "yes" && !phone.specs.fiveG) {
      caveats.push("No tiene 5G.");
    }

    if (reasons.length === 0) {
      reasons.push(`Equilibrio general correcto para el uso que describiste.`);
    }

    return { phone, compatibility, breakdown, reasons, caveats };
  });

  return scored.sort((a, b) => b.compatibility - a.compatibility).slice(0, limit);
}

/** Resumen textual para la cabecera del resultado y para la metadata SEO. */
export function summarizeAnswers(answers: QuizAnswers): string {
  const budget = Number(answers.budget);
  const budgetLabel = budget >= 99000 ? "sin límite de precio" : `hasta ${budget.toLocaleString("es-BO")} Bs`;
  const osLabel = answers.os === "any" ? "Android o iPhone" : answers.os;
  const priorities = [
    { key: "gaming", label: "gaming", value: Number(answers.gaming) },
    { key: "photography", label: "fotografía", value: Number(answers.photography) },
    { key: "battery", label: "batería", value: Number(answers.battery) },
    { key: "work", label: "trabajo", value: Number(answers.work) },
  ]
    .filter((item) => item.value >= 2)
    .map((item) => item.label);

  const priorityLabel = priorities.length > 0 ? `priorizando ${priorities.join(" y ")}` : "de uso general";
  return `${osLabel}, ${budgetLabel}, ${priorityLabel}`;
}
