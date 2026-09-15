import { ImageResponse } from "next/og";
import { sanitizeText } from "@/lib/security/sanitize";

export const runtime = "nodejs";

/**
 * Imagen Open Graph generada al vuelo.
 *
 * Evita tener que mantener imágenes estáticas por producto y garantiza que cada
 * página compartida muestre su propio título.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const title = sanitizeText(url.searchParams.get("title"), 90) || "TechCompare";
  const subtitle = sanitizeText(url.searchParams.get("subtitle"), 120);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          background: "linear-gradient(135deg, #0b0f17 0%, #16233d 100%)",
          color: "#e8edf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#3b5bdb",
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 700 }}>TechCompare</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 28, color: "#94a3b8", lineHeight: 1.35 }}>{subtitle}</div>
          )}
        </div>

        <div style={{ fontSize: 24, color: "#94a3b8" }}>
          Compara celulares, laptops, procesadores y GPUs
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
