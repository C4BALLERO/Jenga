/**
 * Saneamiento de entrada.
 *
 * El riesgo de XSS en esta aplicación es bajo porque React escapa por defecto y
 * no se usa `dangerouslySetInnerHTML` salvo para JSON-LD generado por nosotros.
 * Aun así, todo lo que llega por query string se limpia antes de usarse o de
 * devolverse al usuario.
 */

// Caracteres de control ASCII (0x00-0x1F) y DEL (0x7F).
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

export function sanitizeText(input: unknown, maxLength = 120): string {
  if (typeof input !== "string") return "";
  return input
    .replace(CONTROL_CHARS, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function sanitizeSlug(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.toLowerCase().trim().slice(0, 100);
  return SLUG_PATTERN.test(value) ? value : null;
}

export function sanitizeInteger(input: unknown, min: number, max: number): number | null {
  const value = Number(input);
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

/** JSON-LD seguro: escapa la secuencia que permitiría cerrar la etiqueta script. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
