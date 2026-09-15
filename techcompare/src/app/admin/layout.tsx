import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/providers", label: "Proveedores" },
  { href: "/admin/productos", label: "Productos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="pb-16">
      <div className="border-b border-[var(--border-subtle)] py-6">
        <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">TechCompare</p>
        <h1 className="text-xl font-bold tracking-tight">Panel de administración</h1>
        <nav aria-label="Administración" className="mt-4 flex flex-wrap gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-sm transition-colors hover:border-brand-500/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </Container>
  );
}
