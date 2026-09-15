"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Error inesperado</h1>
          <p style={{ color: "#667085", fontSize: 14, marginBottom: 20 }}>
            La aplicación no ha podido arrancar correctamente.
            {error.digest ? ` Referencia: ${error.digest}.` : ""}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#3b5bdb",
              color: "white",
              border: 0,
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
