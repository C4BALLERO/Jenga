import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Container } from "@/components/ui/Container";
import { isAdminConfigured } from "@/lib/security/auth";

export const metadata: Metadata = {
  title: "Acceso de administración",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Container size="narrow" className="py-20">
      <h1 className="text-2xl font-bold tracking-tight">Acceso de administración</h1>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        Esta zona está restringida. Introduce el token configurado en la variable de entorno
        <code className="mx-1 rounded bg-[var(--surface-2)] px-1 py-0.5 text-xs">ADMIN_TOKEN</code>.
      </p>

      {isAdminConfigured() ? (
        <AdminLoginForm />
      ) : (
        <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <p className="font-semibold">Panel deshabilitado</p>
          <p className="mt-1 text-[var(--ink-muted)]">
            No hay <code>ADMIN_TOKEN</code> definido, así que el panel no es accesible. Es el
            comportamiento esperado: el área de administración nunca queda abierta por omisión.
          </p>
        </div>
      )}
    </Container>
  );
}
