import { z } from "zod";
import { badRequest, guard, json } from "@/lib/api/response";
import { serverEnv } from "@/lib/env";
import { ADMIN_COOKIE } from "@/lib/security/admin-cookie";

const schema = z.object({ token: z.string().min(1).max(256) });

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/** POST /api/admin/login — canjea el token de administración por una cookie de sesión. */
export async function POST(request: Request) {
  // Límite estricto: este endpoint es el único vector de fuerza bruta.
  const { blocked } = guard(request, "admin-login", 5);
  if (blocked) return blocked;

  const expected = serverEnv.ADMIN_TOKEN;
  if (!expected) {
    return json(
      { error: "El panel está deshabilitado: define ADMIN_TOKEN en el entorno." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Cuerpo JSON no válido.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return badRequest("Falta el token.");

  if (!safeEqual(parsed.data.token, expected)) {
    return json({ error: "Token incorrecto." }, { status: 401 });
  }

  const response = json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${encodeURIComponent(expected)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
  return response;
}
