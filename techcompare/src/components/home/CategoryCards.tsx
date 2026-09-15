import { Calculator, Cpu, Laptop, MonitorCog, Smartphone, Target } from "lucide-react";
import Link from "next/link";
import { categoryList } from "@/lib/config";
import { paths } from "@/lib/seo/paths";
import type { ProductCategory } from "@/types/common";

const ICONS = {
  phone: Smartphone,
  laptop: Laptop,
  cpu: Cpu,
  gpu: MonitorCog,
} as const;

const EMOJI: Record<ProductCategory, string> = {
  phone: "📱",
  laptop: "💻",
  cpu: "🧠",
  gpu: "🎮",
};

export function CategoryCards({ counts }: { counts: Record<ProductCategory, number> }) {
  const tools = [
    {
      href: paths.quiz(),
      emoji: "🎯",
      icon: Target,
      title: "¿Qué teléfono me conviene?",
      description: "Responde once preguntas y te decimos cuál encaja contigo.",
    },
    {
      href: paths.calculator(),
      emoji: "💾",
      icon: Calculator,
      title: "Calculadora de almacenamiento",
      description: "Descubre si necesitas 128, 256, 512 GB o 1 TB.",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categoryList.map((category) => {
        const Icon = ICONS[category.key];
        return (
          <Link
            key={category.slug}
            href={paths.category(category.key)}
            className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-900/5"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Icon className="size-5" aria-hidden />
              </span>
              <span aria-hidden className="text-xl">
                {EMOJI[category.key]}
              </span>
            </div>
            <h3 className="font-semibold transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
              Comparar {category.plural}
            </h3>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">{category.description}</p>
            <p className="mt-3 text-xs text-[var(--ink-muted)] tabular-nums">
              {counts[category.key]} modelos en el catálogo
            </p>
          </Link>
        );
      })}

      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-brand-500/30 bg-brand-500/5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/60 hover:shadow-lg hover:shadow-brand-900/5"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Icon className="size-5" aria-hidden />
              </span>
              <span aria-hidden className="text-xl">
                {tool.emoji}
              </span>
            </div>
            <h3 className="font-semibold transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
              {tool.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">{tool.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
