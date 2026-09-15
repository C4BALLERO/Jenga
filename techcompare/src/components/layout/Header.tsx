"use client";

import { Calculator, Layers, Menu, Target, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categoryList } from "@/lib/config";
import { paths } from "@/lib/seo/paths";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

const TOOLS = [
  { href: paths.quiz(), label: "¿Qué teléfono me conviene?", icon: Target },
  { href: paths.calculator(), label: "Calculadora de almacenamiento", icon: Calculator },
];

export function Header() {
  const pathname = usePathname();
  // El menú se ancla a la ruta en la que se abrió: al navegar se cierra solo,
  // sin necesidad de un efecto que dispare un render extra.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const open = menu.open && menu.path === pathname;
  const setOpen = (value: boolean) => setMenu({ open: value, path: pathname });

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--surface)]/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Layers className="size-4" />
            </span>
            <span className="text-lg">
              Tech<span className="text-brand-600 dark:text-brand-400">Compare</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 items-center gap-1 lg:flex">
            <Link
              href="/"
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/"
                  ? "text-brand-600 dark:text-brand-300"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
              )}
            >
              Inicio
            </Link>
            {categoryList.map((category) => (
              <Link
                key={category.slug}
                href={paths.category(category.key)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(paths.category(category.key))
                    ? "text-brand-600 dark:text-brand-300"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                )}
              >
                {category.label}
              </Link>
            ))}
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(tool.href)
                    ? "text-brand-600 dark:text-brand-300"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                )}
              >
                {tool.href === paths.quiz() ? "¿Qué teléfono me conviene?" : "Calculadora"}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden w-64 xl:block">
            <SearchBar size="sm" placeholder="Buscar..." />
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="rounded-lg border border-[var(--border-subtle)] p-2 lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface)] lg:hidden animate-fade-in">
          <Container className="py-4">
            <SearchBar size="md" />
            <nav aria-label="Menú móvil" className="mt-4 grid gap-1">
              <Link href="/" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
                Inicio
              </Link>
              {categoryList.map((category) => (
                <Link
                  key={category.slug}
                  href={paths.category(category.key)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
                >
                  {category.label}
                </Link>
              ))}
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
                  >
                    <Icon className="size-4 text-brand-600" />
                    {tool.label}
                  </Link>
                );
              })}
              <Link href={paths.guides()} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
                Guías de compra
              </Link>
            </nav>
            <div className="mt-4 sm:hidden">
              <ThemeToggle />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
