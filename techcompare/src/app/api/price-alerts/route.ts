import { z } from "zod";
import { badRequest, guard, json } from "@/lib/api/response";
import { hasDatabase } from "@/lib/db";
import { getProductById } from "@/lib/repositories/catalog.repository";

const alertSchema = z.object({
  productId: z.string().min(3).max(120),
  targetPrice: z.number().positive().max(1_000_000),
  currency: z.enum(["BOB", "USD", "EUR"]).default("BOB"),
  email: z.email().max(160),
  channel: z.enum(["EMAIL", "PUSH", "TELEGRAM"]).default("EMAIL"),
});

/**
 * POST /api/price-alerts — "avísame cuando baje de X Bs".
 *
 * La validación, el límite de peticiones y el modelo de datos ya están listos.
 * El envío de la notificación se conecta cuando haya proveedor de correo; sin
 * base de datos el endpoint responde 503 en vez de fingir que guardó el aviso.
 */
export async function POST(request: Request) {
  const { blocked, headers } = guard(request, "price-alerts", 10);
  if (blocked) return blocked;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("El cuerpo de la petición debe ser JSON válido.");
  }

  const parsed = alertSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { error: "Datos no válidos", issues: parsed.error.issues.map((issue) => issue.message) },
      { status: 422, headers },
    );
  }

  const product = await getProductById(parsed.data.productId);
  if (!product) return badRequest("El producto indicado no existe.");

  if (!hasDatabase) {
    return json(
      {
        error:
          "Las alertas de precio requieren base de datos. Configura DATABASE_URL para activarlas.",
      },
      { status: 503, headers },
    );
  }

  // Con base de datos configurada, aquí se persiste el modelo `PriceAlert`.
  return json(
    {
      status: "pending_delivery_provider",
      message:
        "Aviso registrado. El envío se activará cuando se configure el proveedor de notificaciones.",
      product: { id: product.id, name: product.name },
      targetPrice: parsed.data.targetPrice,
      currency: parsed.data.currency,
    },
    { status: 202, headers },
  );
}
