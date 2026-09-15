/**
 * Parsers sin dependencias externas para catálogos cedidos por tiendas.
 * Cubren los tres formatos habituales: CSV, XML (estilo RSS/Google Merchant)
 * y JSON (array plano o envuelto en `items`/`products`/`data`).
 */

/** CSV con soporte de comillas dobles y saltos de línea escapados. */
export function parseCsv(input: string, delimiter = ","): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (!header) return [];

  const keys = header.map((key) => key.trim());
  return body.map((cells) => {
    const record: Record<string, string> = {};
    keys.forEach((key, index) => {
      record[key] = (cells[index] ?? "").trim();
    });
    return record;
  });
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Extrae los nodos repetidos de un XML plano (`<item>`, `<product>`, `<entry>`)
 * y los convierte en registros clave/valor. Pensado para feeds de producto,
 * no para XML arbitrariamente anidado.
 */
export function parseXmlItems(input: string, itemTag?: string): Record<string, string>[] {
  const candidates = itemTag ? [itemTag] : ["item", "product", "entry", "offer"];
  const tag = candidates.find((candidate) =>
    new RegExp(`<${candidate}[\\s>]`, "i").test(input),
  );
  if (!tag) return [];

  const itemRegex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  const results: Record<string, string>[] = [];

  for (const match of input.matchAll(itemRegex)) {
    const body = match[1];
    const record: Record<string, string> = {};
    const fieldRegex = /<([\w:-]+)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;

    for (const field of body.matchAll(fieldRegex)) {
      const key = field[1].replace(/^.*:/, "").trim();
      const value = decodeEntities(field[2]).trim();
      if (value && !record[key]) record[key] = value;
    }

    if (Object.keys(record).length > 0) results.push(record);
  }

  return results;
}

export function parseJsonItems(input: string): Record<string, unknown>[] {
  const parsed: unknown = JSON.parse(input);

  if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];

  if (parsed && typeof parsed === "object") {
    const candidateKeys = ["items", "products", "data", "results", "records"];
    for (const key of candidateKeys) {
      const value = (parsed as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as Record<string, unknown>[];
    }
  }

  return [];
}

export type FeedFormat = "csv" | "xml" | "json";

export function detectFeedFormat(url: string, contentType?: string | null): FeedFormat {
  const haystack = `${url} ${contentType ?? ""}`.toLowerCase();
  if (haystack.includes("csv")) return "csv";
  if (haystack.includes("xml") || haystack.includes("rss")) return "xml";
  return "json";
}
