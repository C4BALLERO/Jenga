/**
 * Calculadora de almacenamiento.
 *
 * Todas las constantes son estimaciones medias declaradas de forma explícita,
 * no cifras de fabricante. Se exponen aquí para que puedan ajustarse en un solo
 * sitio y para que la interfaz pueda mostrarlas al usuario.
 */

export type VideoQuality = "1080p30" | "1080p60" | "4k30" | "4k60";
export type MessagingUse = "light" | "medium" | "heavy";

/** Megabytes por unidad. */
export const ESTIMATES = {
  /** Una foto de 12-50 MP en HEIC/JPEG comprimido. */
  photoMb: 4,
  videoPerMinuteMb: {
    "1080p30": 90,
    "1080p60": 150,
    "4k30": 350,
    "4k60": 600,
  } as Record<VideoQuality, number>,
  /** Aplicación media instalada, con sus datos. */
  appMb: 180,
  /** Juego móvil medio. */
  gameMb: 2600,
  /** Una canción descargada en calidad alta. */
  songMb: 9,
  /** Documentos, PDF y hojas de cálculo por cada 100 archivos. */
  documentsPer100Mb: 350,
  /** Crecimiento anual de la carpeta de mensajería. */
  messagingPerYearGb: { light: 2, medium: 6, heavy: 15 } as Record<MessagingUse, number>,
  /** Espacio que se queda el sistema operativo y sus cachés. */
  systemReserveGb: 20,
} as const;

export interface StorageInput {
  photosPerMonth: number;
  videoMinutesPerMonth: number;
  videoQuality: VideoQuality;
  apps: number;
  games: number;
  songs: number;
  documents: number;
  messaging: MessagingUse;
  years: number;
}

export interface StorageSegment {
  key: string;
  label: string;
  gb: number;
}

export interface StorageOptionResult {
  capacity: number;
  /** Capacidad real utilizable: el fabricante anuncia GB decimales. */
  usableGb: number;
  freeGb: number;
  usedPct: number;
  verdict: "insuficiente" | "justo" | "adecuado" | "de sobra";
}

export interface StorageResult {
  totalGb: number;
  segments: StorageSegment[];
  recommended: number;
  options: StorageOptionResult[];
  /** Explicación legible del cálculo. */
  notes: string[];
}

export const STORAGE_OPTIONS = [128, 256, 512, 1024];

export const DEFAULT_STORAGE_INPUT: StorageInput = {
  photosPerMonth: 150,
  videoMinutesPerMonth: 20,
  videoQuality: "1080p30",
  apps: 45,
  games: 3,
  songs: 200,
  documents: 100,
  messaging: "medium",
  years: 3,
};

const toGb = (mb: number) => mb / 1024;

function clampInput(input: StorageInput): StorageInput {
  return {
    photosPerMonth: Math.max(0, Math.min(5000, Math.round(input.photosPerMonth) || 0)),
    videoMinutesPerMonth: Math.max(0, Math.min(1000, Math.round(input.videoMinutesPerMonth) || 0)),
    videoQuality: input.videoQuality,
    apps: Math.max(0, Math.min(500, Math.round(input.apps) || 0)),
    games: Math.max(0, Math.min(100, Math.round(input.games) || 0)),
    songs: Math.max(0, Math.min(20000, Math.round(input.songs) || 0)),
    documents: Math.max(0, Math.min(20000, Math.round(input.documents) || 0)),
    messaging: input.messaging,
    years: Math.max(1, Math.min(6, Math.round(input.years) || 1)),
  };
}

export function calculateStorage(rawInput: StorageInput): StorageResult {
  const input = clampInput(rawInput);
  const months = input.years * 12;

  const photosGb = toGb(input.photosPerMonth * months * ESTIMATES.photoMb);
  const videosGb = toGb(
    input.videoMinutesPerMonth * months * ESTIMATES.videoPerMinuteMb[input.videoQuality],
  );
  const appsGb = toGb(input.apps * ESTIMATES.appMb);
  const gamesGb = toGb(input.games * ESTIMATES.gameMb);
  const musicGb = toGb(input.songs * ESTIMATES.songMb);
  const documentsGb = toGb((input.documents / 100) * ESTIMATES.documentsPer100Mb);
  const messagingGb = ESTIMATES.messagingPerYearGb[input.messaging] * input.years;

  const segments: StorageSegment[] = [
    { key: "system", label: "Sistema y cachés", gb: ESTIMATES.systemReserveGb },
    { key: "photos", label: "Fotos", gb: photosGb },
    { key: "videos", label: "Vídeos", gb: videosGb },
    { key: "apps", label: "Aplicaciones", gb: appsGb },
    { key: "games", label: "Juegos", gb: gamesGb },
    { key: "music", label: "Música descargada", gb: musicGb },
    { key: "messaging", label: "WhatsApp / Telegram", gb: messagingGb },
    { key: "documents", label: "Documentos", gb: documentsGb },
  ].map((segment) => ({ ...segment, gb: Math.round(segment.gb * 10) / 10 }));

  const totalGb = Math.round(segments.reduce((sum, segment) => sum + segment.gb, 0) * 10) / 10;

  const options: StorageOptionResult[] = STORAGE_OPTIONS.map((capacity) => {
    // Un equipo de 128 GB anunciados ofrece en torno a 119 GiB utilizables.
    const usableGb = Math.round(capacity * 0.931 * 10) / 10;
    const freeGb = Math.round((usableGb - totalGb) * 10) / 10;
    const usedPct = Math.round((totalGb / usableGb) * 100);

    return {
      capacity,
      usableGb,
      freeGb,
      usedPct,
      verdict:
        usedPct > 100 ? "insuficiente" : usedPct > 85 ? "justo" : usedPct > 55 ? "adecuado" : "de sobra",
    };
  });

  const recommended =
    options.find((option) => option.verdict === "adecuado")?.capacity ??
    options.find((option) => option.verdict === "de sobra")?.capacity ??
    STORAGE_OPTIONS[STORAGE_OPTIONS.length - 1];

  const notes = [
    `El cálculo cubre ${input.years} año${input.years === 1 ? "" : "s"} de uso.`,
    `Se reservan ${ESTIMATES.systemReserveGb} GB para el sistema operativo y sus cachés.`,
    `Se estima ${ESTIMATES.photoMb} MB por foto y ${ESTIMATES.videoPerMinuteMb[input.videoQuality]} MB por minuto de vídeo en ${input.videoQuality.toUpperCase()}.`,
    "La capacidad real utilizable es menor que la anunciada porque el fabricante cuenta en gigabytes decimales.",
  ];

  return { totalGb, segments, recommended, options, notes };
}

/** Serializa la entrada a parámetros de URL para poder compartir el resultado. */
export function storageInputToParams(input: StorageInput): URLSearchParams {
  const params = new URLSearchParams();
  params.set("ph", String(input.photosPerMonth));
  params.set("vi", String(input.videoMinutesPerMonth));
  params.set("vq", input.videoQuality);
  params.set("ap", String(input.apps));
  params.set("ga", String(input.games));
  params.set("mu", String(input.songs));
  params.set("do", String(input.documents));
  params.set("ms", input.messaging);
  params.set("yr", String(input.years));
  return params;
}

const VIDEO_QUALITIES: VideoQuality[] = ["1080p30", "1080p60", "4k30", "4k60"];
const MESSAGING_USES: MessagingUse[] = ["light", "medium", "heavy"];

export function parseStorageInput(params: Record<string, string | undefined>): StorageInput {
  const number = (key: string, fallback: number) => {
    const value = Number(params[key]);
    return Number.isFinite(value) ? value : fallback;
  };

  const quality = params.vq as VideoQuality | undefined;
  const messaging = params.ms as MessagingUse | undefined;

  return clampInput({
    photosPerMonth: number("ph", DEFAULT_STORAGE_INPUT.photosPerMonth),
    videoMinutesPerMonth: number("vi", DEFAULT_STORAGE_INPUT.videoMinutesPerMonth),
    videoQuality: quality && VIDEO_QUALITIES.includes(quality) ? quality : DEFAULT_STORAGE_INPUT.videoQuality,
    apps: number("ap", DEFAULT_STORAGE_INPUT.apps),
    games: number("ga", DEFAULT_STORAGE_INPUT.games),
    songs: number("mu", DEFAULT_STORAGE_INPUT.songs),
    documents: number("do", DEFAULT_STORAGE_INPUT.documents),
    messaging: messaging && MESSAGING_USES.includes(messaging) ? messaging : DEFAULT_STORAGE_INPUT.messaging,
    years: number("yr", DEFAULT_STORAGE_INPUT.years),
  });
}
