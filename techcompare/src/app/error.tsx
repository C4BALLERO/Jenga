"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/States";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción esto se envía al servicio de observabilidad.
    console.error("Error de renderizado:", error.message, error.digest);
  }, [error]);

  return (
    <Container size="narrow" className="py-20">
      <ErrorState
        description="No hemos podido cargar esta página. Vuelve a intentarlo; si el problema continúa, escríbenos."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={reset} size="sm">
              Reintentar
            </Button>
            <ButtonLink href="/" variant="secondary" size="sm">
              Volver al inicio
            </ButtonLink>
          </div>
        }
      />
    </Container>
  );
}
