import { serverEnv } from "@/lib/env";

/** Comparación en tiempo constante para no filtrar información por temporización. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return request.headers.get("x-admin-token");
}

/**
 * Autorización del área de administración.
 *
 * Si `ADMIN_TOKEN` no está configurado, el panel queda en modo solo lectura y
 * cualquier operación de escritura se rechaza. Nunca se abre por defecto.
 */
export function isAdminRequest(request: Request): boolean {
  const expected = serverEnv.ADMIN_TOKEN;
  if (!expected) return false;
  const provided = bearerToken(request);
  return Boolean(provided && safeEqual(provided, expected));
}

export function isAdminConfigured(): boolean {
  return Boolean(serverEnv.ADMIN_TOKEN);
}

/** Autorización de los cron jobs (Vercel Cron envía `Authorization: Bearer ...`). */
export function isCronRequest(request: Request): boolean {
  const expected = serverEnv.CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization");
  const provided = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  return Boolean(provided && safeEqual(provided, expected));
}

export function unauthorized(message = "No autorizado"): Response {
  return Response.json({ error: message }, { status: 401 });
}
