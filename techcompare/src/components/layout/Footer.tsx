import { Layers } from "lucide-react";
import Link from "next/link";
import { collections } from "@/data/collections";
import { categoryList, siteConfig } from "@/lib/config";
import { paths } from "@/lib/seo/paths";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const featured = collections.slice(0, 6);

  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--surface-2)]/50">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Layers className="size-3.5" />
              </span>
              TechCompare
            </div>
            <p className="mt-3 max-w-xs text-sm text-[var(--ink-muted)]">
              {siteConfig.shortDescription}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Comparadores</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
              {categoryList.map((category) => (
                <li key={category.slug}>
                  <Link href={paths.category(category.key)} className="hover:text-[var(--ink)]">
                    Comparar {category.plural}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Herramientas</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
              <li>
                <Link href={paths.quiz()} className="hover:text-[var(--ink)]">
                  ¿Qué teléfono me conviene?
                </Link>
              </li>
              <li>
                <Link href={paths.calculator()} className="hover:text-[var(--ink)]">
                  Calculadora de almacenamiento
                </Link>
              </li>
              <li>
                <Link href={paths.guides()} className="hover:text-[var(--ink)]">
                  Guías de compra
                </Link>
              </li>
              <li>
                <Link href={paths.search()} className="hover:text-[var(--ink)]">
                  Buscador
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Rankings</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
              {featured.map((collection) => (
                <li key={collection.slug}>
                  <Link href={paths.collection(collection.slug)} className="hover:text-[var(--ink)]">
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--ink-muted)]">
          <p>
            Catálogo en fase inicial: las especificaciones mostradas son datos de demostración
            marcados como no verificados hasta que se conecten las fuentes oficiales de cada
            fabricante y tienda.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} TechCompare. Precios orientativos en bolivianos.
          </p>
        </div>
      </Container>
    </footer>
  );
}
