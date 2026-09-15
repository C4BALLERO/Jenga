import { AlertTriangle, PackageOpen, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function Shell({
  icon,
  title,
  description,
  action,
  tone = "neutral",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "neutral" | "danger";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center",
        tone === "danger"
          ? "border-rose-500/40 bg-rose-500/5"
          : "border-[var(--border-subtle)] bg-[var(--surface-2)]/60",
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-full",
          tone === "danger" ? "bg-rose-500/15 text-rose-500" : "bg-brand-500/10 text-brand-600",
        )}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[var(--ink-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function EmptyState({
  title = "Sin resultados",
  description = "Prueba a quitar algún filtro o a buscar con otras palabras.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return <Shell icon={<PackageOpen className="size-6" />} title={title} description={description} action={action} />;
}

export function NoResultsState({
  query,
  action,
}: {
  query: string;
  action?: ReactNode;
}) {
  return (
    <Shell
      icon={<SearchX className="size-6" />}
      title={`Sin coincidencias para "${query}"`}
      description="Revisa la ortografía o prueba con el nombre del modelo, la marca o el procesador."
      action={action}
    />
  );
}

export function ErrorState({
  title = "Algo no ha salido bien",
  description = "No hemos podido cargar esta información. Vuelve a intentarlo en unos segundos.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Shell
      icon={<AlertTriangle className="size-6" />}
      title={title}
      description={description}
      action={action}
      tone="danger"
    />
  );
}
