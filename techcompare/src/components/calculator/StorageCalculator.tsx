"use client";

import { HardDrive, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { trackCalculator } from "@/lib/analytics/events";
import {
  DEFAULT_STORAGE_INPUT,
  calculateStorage,
  type MessagingUse,
  type StorageInput,
  type VideoQuality,
} from "@/lib/calculator/storage";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

const SEGMENT_COLORS: Record<string, string> = {
  system: "bg-slate-400",
  photos: "bg-brand-500",
  videos: "bg-violet-500",
  apps: "bg-emerald-500",
  games: "bg-amber-500",
  music: "bg-pink-500",
  messaging: "bg-cyan-500",
  documents: "bg-orange-400",
};

const VERDICT_STYLES: Record<string, string> = {
  insuficiente: "border-rose-500/50 bg-rose-500/5",
  justo: "border-amber-500/50 bg-amber-500/5",
  adecuado: "border-emerald-500/60 bg-emerald-500/8",
  "de sobra": "border-[var(--border-subtle)]",
};

const VIDEO_QUALITY_LABELS: Record<VideoQuality, string> = {
  "1080p30": "1080p a 30 fps",
  "1080p60": "1080p a 60 fps",
  "4k30": "4K a 30 fps",
  "4k60": "4K a 60 fps",
};

const MESSAGING_LABELS: Record<MessagingUse, string> = {
  light: "Poco (pocos grupos)",
  medium: "Normal (varios grupos)",
  heavy: "Intenso (muchos grupos y archivos)",
};

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 5000,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-brand-600 dark:text-brand-300">
          {formatNumber(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[oklch(0.55_0.21_262)]"
      />
      {hint && <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">{hint}</span>}
    </label>
  );
}

export function StorageCalculator({ initialInput }: { initialInput?: StorageInput }) {
  const [input, setInput] = useState<StorageInput>(initialInput ?? DEFAULT_STORAGE_INPUT);
  const result = useMemo(() => calculateStorage(input), [input]);
  const [tracked, setTracked] = useState(false);

  const update = <K extends keyof StorageInput>(key: K, value: StorageInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
    if (!tracked) {
      trackCalculator(result.recommended, result.totalGb);
      setTracked(true);
    }
  };

  const visibleSegments = result.segments.filter((segment) => segment.gb > 0.2);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold">Cuéntanos cómo usas el teléfono</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            label="Fotos al mes"
            value={input.photosPerMonth}
            onChange={(value) => update("photosPerMonth", value)}
            max={1000}
            step={10}
          />
          <NumberField
            label="Minutos de vídeo al mes"
            value={input.videoMinutesPerMonth}
            onChange={(value) => update("videoMinutesPerMonth", value)}
            max={300}
            step={5}
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Calidad de vídeo</span>
            <select
              value={input.videoQuality}
              onChange={(event) => update("videoQuality", event.target.value as VideoQuality)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {Object.entries(VIDEO_QUALITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">WhatsApp / Telegram</span>
            <select
              value={input.messaging}
              onChange={(event) => update("messaging", event.target.value as MessagingUse)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {Object.entries(MESSAGING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <NumberField
            label="Aplicaciones instaladas"
            value={input.apps}
            onChange={(value) => update("apps", value)}
            max={200}
          />
          <NumberField
            label="Juegos instalados"
            value={input.games}
            onChange={(value) => update("games", value)}
            max={30}
          />
          <NumberField
            label="Canciones descargadas"
            value={input.songs}
            onChange={(value) => update("songs", value)}
            max={5000}
            step={50}
          />
          <NumberField
            label="Documentos guardados"
            value={input.documents}
            onChange={(value) => update("documents", value)}
            max={5000}
            step={50}
          />
          <NumberField
            label="Años que quieres usarlo"
            value={input.years}
            onChange={(value) => update("years", value)}
            min={1}
            max={6}
          />
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-sm text-[var(--ink-muted)]">Almacenamiento recomendado</p>
          <p className="mt-1 flex items-baseline gap-2 text-4xl font-bold tracking-tight">
            <HardDrive className="size-7 text-brand-600" aria-hidden />
            {result.recommended >= 1024 ? "1 TB" : `${result.recommended} GB`}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Necesitarás alrededor de{" "}
            <strong className="text-[var(--ink)] tabular-nums">
              {formatNumber(result.totalGb, 1)} GB
            </strong>{" "}
            en {input.years} año{input.years === 1 ? "" : "s"}.
          </p>

          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
            {visibleSegments.map((segment) => (
              <div
                key={segment.key}
                className={cn("h-full", SEGMENT_COLORS[segment.key])}
                style={{ width: `${(segment.gb / result.totalGb) * 100}%` }}
                title={`${segment.label}: ${formatNumber(segment.gb, 1)} GB`}
              />
            ))}
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {visibleSegments.map((segment) => (
              <li key={segment.key} className="flex items-center gap-1.5">
                <span className={cn("size-2 shrink-0 rounded-full", SEGMENT_COLORS[segment.key])} />
                <span className="min-w-0 flex-1 truncate text-[var(--ink-muted)]">{segment.label}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatNumber(segment.gb, 0)} GB
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-2">
          {result.options.map((option) => (
            <div
              key={option.capacity}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                VERDICT_STYLES[option.verdict],
                option.capacity === result.recommended && "ring-2 ring-emerald-500/30",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {option.capacity >= 1024 ? "1 TB" : `${option.capacity} GB`}
                </p>
                <p className="text-xs capitalize text-[var(--ink-muted)]">{option.verdict}</p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    option.usedPct > 100
                      ? "bg-rose-500"
                      : option.usedPct > 85
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${Math.min(100, option.usedPct)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[var(--ink-muted)] tabular-nums">
                {option.freeGb >= 0
                  ? `Te quedarían unos ${formatNumber(option.freeGb, 0)} GB libres de ${formatNumber(option.usableGb, 0)} GB reales.`
                  : `Te faltarían unos ${formatNumber(Math.abs(option.freeGb), 0)} GB.`}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)]/50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <Info className="size-3.5" aria-hidden />
            Cómo se calcula
          </p>
          <ul className="space-y-1 text-xs text-[var(--ink-muted)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
