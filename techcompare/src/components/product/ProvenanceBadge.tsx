import { CircleAlert, ShieldCheck, Sparkles } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { relativeTime } from "@/lib/utils";
import type { DataProvenance } from "@/types/common";

const CONFIG: Record<
  DataProvenance["confidence"],
  { label: string; variant: BadgeVariant; icon: typeof ShieldCheck; title: string }
> = {
  verified: {
    label: "Dato verificado",
    variant: "success",
    icon: ShieldCheck,
    title: "Obtenido de una fuente oficial del fabricante o de la tienda.",
  },
  reported: {
    label: "Dato de proveedor",
    variant: "brand",
    icon: Sparkles,
    title: "Obtenido de una integración autorizada, pendiente de contraste.",
  },
  estimated: {
    label: "Dato estimado",
    variant: "warning",
    icon: CircleAlert,
    title: "Calculado a partir de otros datos; puede diferir de la ficha oficial.",
  },
  demo: {
    label: "Dato de demostración",
    variant: "warning",
    icon: CircleAlert,
    title:
      "Catálogo inicial sin verificar. Se sustituirá al conectar la fuente oficial correspondiente.",
  },
};

/** Etiqueta de confianza del dato. Se muestra en toda ficha de producto. */
export function ProvenanceBadge({ provenance }: { provenance: DataProvenance }) {
  const config = CONFIG[provenance.confidence];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} title={config.title}>
      <Icon className="size-3" aria-hidden />
      {config.label}
    </Badge>
  );
}

/** Línea discreta con fuente y antigüedad del dato. */
export function ProvenanceNote({
  provenance,
  className,
}: {
  provenance: DataProvenance;
  className?: string;
}) {
  return (
    <p className={className ?? "text-xs text-[var(--ink-muted)]"}>
      Datos actualizados desde{" "}
      {provenance.sourceUrl ? (
        <a
          href={provenance.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline underline-offset-2 hover:text-[var(--ink)]"
        >
          {provenance.sourceLabel}
        </a>
      ) : (
        <span className="font-medium">{provenance.sourceLabel}</span>
      )}
      {" · "}
      <time dateTime={provenance.lastUpdated}>{relativeTime(provenance.lastUpdated)}</time>
    </p>
  );
}
