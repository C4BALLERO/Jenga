import { buildCpus, buildGpus, buildLaptops, buildPhones } from "@/lib/scoring/derive";
import type { ProductCategory } from "@/types/common";
import type { AnyProduct, Cpu, Gpu, Laptop, Phone } from "@/types/products";
import { cpuSeeds } from "./cpus";
import { gpuSeeds } from "./gpus";
import { laptopSeeds } from "./laptops";
import { phoneSeeds } from "./phones";

/**
 * Catálogo en memoria derivado de los datos iniciales.
 *
 * Es la fuente que usa el repositorio cuando no hay base de datos configurada
 * (`DATABASE_URL` ausente), de modo que la aplicación funciona íntegramente en
 * desarrollo y en una primera publicación sin infraestructura adicional.
 */
export const phones: Phone[] = buildPhones(phoneSeeds);
export const laptops: Laptop[] = buildLaptops(laptopSeeds);
export const cpus: Cpu[] = buildCpus(cpuSeeds);
export const gpus: Gpu[] = buildGpus(gpuSeeds);

export const catalogByCategory: Record<ProductCategory, AnyProduct[]> = {
  phone: phones,
  laptop: laptops,
  cpu: cpus,
  gpu: gpus,
};

export const allProducts: AnyProduct[] = [...phones, ...laptops, ...cpus, ...gpus];

export const productBySlug = new Map<string, AnyProduct>(
  allProducts.map((product) => [`${product.category}:${product.slug}`, product]),
);

export const productById = new Map<string, AnyProduct>(
  allProducts.map((product) => [product.id, product]),
);

export function findProduct(category: ProductCategory, slug: string): AnyProduct | undefined {
  return productBySlug.get(`${category}:${slug}`);
}

export const CATALOG_SIZE = allProducts.length;
