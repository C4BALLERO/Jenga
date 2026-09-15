export type QuizQuestionId =
  | "budget"
  | "mainUse"
  | "gaming"
  | "photography"
  | "social"
  | "work"
  | "battery"
  | "screen"
  | "os"
  | "network"
  | "storage";

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  /** Clave corta usada en la URL compartible. */
  param: string;
  title: string;
  help?: string;
  options: QuizOption[];
  defaultValue: string;
}

const IMPORTANCE: QuizOption[] = [
  { value: "0", label: "Nada importante" },
  { value: "1", label: "Poco importante" },
  { value: "2", label: "Bastante importante" },
  { value: "3", label: "Es mi prioridad" },
];

/**
 * Cuestionario del recomendador. Vive en `data/` a propósito: cambiar las
 * preguntas no debería obligar a tocar componentes ni lógica de puntuación.
 */
export const quizQuestions: QuizQuestion[] = [
  {
    id: "budget",
    param: "p",
    title: "¿Cuál es tu presupuesto?",
    help: "Filtramos por precio de referencia en bolivianos.",
    defaultValue: "4000",
    options: [
      { value: "1500", label: "Hasta 1.500 Bs", description: "Gama de entrada" },
      { value: "2500", label: "Hasta 2.500 Bs", description: "Gama media accesible" },
      { value: "4000", label: "Hasta 4.000 Bs", description: "Gama media" },
      { value: "6500", label: "Hasta 6.500 Bs", description: "Gama media-alta" },
      { value: "9000", label: "Hasta 9.000 Bs", description: "Gama alta" },
      { value: "99000", label: "Sin límite", description: "Lo mejor disponible" },
    ],
  },
  {
    id: "mainUse",
    param: "u",
    title: "¿Para qué usarás principalmente el teléfono?",
    defaultValue: "mixed",
    options: [
      { value: "mixed", label: "Un poco de todo" },
      { value: "gaming", label: "Jugar" },
      { value: "photo", label: "Fotos y vídeo" },
      { value: "social", label: "Redes sociales y mensajería" },
      { value: "work", label: "Trabajo y estudio" },
    ],
  },
  {
    id: "gaming",
    param: "g",
    title: "¿Qué importancia tiene el gaming?",
    defaultValue: "1",
    options: IMPORTANCE,
  },
  {
    id: "photography",
    param: "f",
    title: "¿Qué importancia tiene la fotografía?",
    defaultValue: "2",
    options: IMPORTANCE,
  },
  {
    id: "social",
    param: "s",
    title: "¿Qué importancia tienen las redes sociales?",
    defaultValue: "2",
    options: IMPORTANCE,
  },
  {
    id: "work",
    param: "w",
    title: "¿Qué importancia tiene el trabajo o el estudio?",
    defaultValue: "1",
    options: IMPORTANCE,
  },
  {
    id: "battery",
    param: "b",
    title: "¿Qué importancia tiene la batería?",
    defaultValue: "2",
    options: IMPORTANCE,
  },
  {
    id: "screen",
    param: "d",
    title: "¿Qué tamaño de pantalla prefieres?",
    defaultValue: "any",
    options: [
      { value: "compact", label: "Compacta", description: "Hasta 6,4 pulgadas" },
      { value: "large", label: "Grande", description: "Desde 6,6 pulgadas" },
      { value: "any", label: "Me da igual" },
    ],
  },
  {
    id: "os",
    param: "o",
    title: "¿Android o iPhone?",
    defaultValue: "any",
    options: [
      { value: "Android", label: "Android" },
      { value: "iOS", label: "iPhone" },
      { value: "any", label: "Me da igual" },
    ],
  },
  {
    id: "network",
    param: "n",
    title: "¿Necesitas 5G?",
    defaultValue: "any",
    options: [
      { value: "yes", label: "Sí, es imprescindible" },
      { value: "any", label: "No es determinante" },
    ],
  },
  {
    id: "storage",
    param: "a",
    title: "¿Cuánto almacenamiento necesitas?",
    help: "Si no lo tienes claro, usa la calculadora de almacenamiento.",
    defaultValue: "128",
    options: [
      { value: "64", label: "64 GB o más" },
      { value: "128", label: "128 GB o más" },
      { value: "256", label: "256 GB o más" },
      { value: "512", label: "512 GB o más" },
    ],
  },
];

export const quizQuestionById = new Map(quizQuestions.map((question) => [question.id, question]));
export const quizQuestionByParam = new Map(quizQuestions.map((question) => [question.param, question]));
