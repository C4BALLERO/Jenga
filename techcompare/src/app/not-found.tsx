import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/layout/SearchBar";
import { categoryList } from "@/lib/config";
import { paths } from "@/lib/seo/paths";

export default function NotFound() {
  return (
    <Container size="narrow" className="py-20 text-center">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">Error 404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Esta página no existe
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--ink-muted)]">
        Puede que el producto ya no esté en el catálogo o que la dirección esté mal escrita. Prueba
        a buscarlo.
      </p>

      <div className="mx-auto mt-6 max-w-lg">
        <SearchBar />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categoryList.map((category) => (
          <ButtonLink
            key={category.slug}
            href={paths.category(category.key)}
            variant="secondary"
            size="sm"
          >
            {category.label}
          </ButtonLink>
        ))}
      </div>
    </Container>
  );
}
