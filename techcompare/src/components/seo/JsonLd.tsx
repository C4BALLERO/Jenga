import { serializeJsonLd } from "@/lib/security/sanitize";

/**
 * Inserta datos estructurados. El contenido siempre lo generamos nosotros a
 * partir de objetos tipados, nunca proviene directamente del usuario, y se
 * serializa escapando `<` para que no pueda cerrar la etiqueta.
 */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }}
        />
      ))}
    </>
  );
}
