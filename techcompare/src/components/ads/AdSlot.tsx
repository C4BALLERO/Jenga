import { features } from "@/lib/config";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

export type AdFormat = "leaderboard" | "rectangle" | "in-article" | "in-feed" | "sidebar";

const SIZES: Record<AdFormat, string> = {
  leaderboard: "min-h-[90px]",
  rectangle: "min-h-[250px]",
  "in-article": "min-h-[120px]",
  "in-feed": "min-h-[120px]",
  sidebar: "min-h-[600px]",
};

/**
 * Espacio publicitario reservado.
 *
 * No carga ningún script de terceros mientras `NEXT_PUBLIC_ADS_ENABLED` no sea
 * "true" y exista un identificador de cliente. Así el rendimiento y la
 * privacidad no se ven afectados antes de monetizar, y el hueco ya está
 * reservado para que activar la publicidad no provoque saltos de maquetación.
 */
export function AdSlot({
  format = "in-article",
  slotId,
  className,
  label = "Publicidad",
}: {
  format?: AdFormat;
  slotId?: string;
  className?: string;
  label?: string;
}) {
  const clientId = publicEnv.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const active = features.adsEnabled && Boolean(clientId);

  if (!active) {
    // Reserva de espacio silenciosa: invisible para el lector, sin CLS al activar.
    return (
      <div
        aria-hidden
        data-ad-slot={slotId ?? format}
        className={cn("w-full", SIZES[format], className)}
      />
    );
  }

  return (
    <aside
      aria-label={label}
      className={cn(
        "flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-[var(--border-subtle)]",
        SIZES[format],
        className,
      )}
    >
      <ins
        className="adsbygoogle block w-full"
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
