/**
 * Carga inicial de la base de datos.
 *
 * Toma exactamente el mismo catálogo que usa la aplicación cuando no hay
 * `DATABASE_URL`, de modo que la versión con y sin base de datos muestran los
 * mismos productos. Es idempotente: se puede ejecutar tantas veces como haga
 * falta sin duplicar filas.
 *
 *   npx prisma migrate dev && npx prisma db seed
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Category, type Confidence } from "@prisma/client";
import { allProducts, cpus, gpus, laptops, phones } from "../src/data/catalog";
import { brands } from "../src/data/brands";
import { buildOffers, buildPriceHistory } from "../src/data/offers";
import { retailers } from "../src/data/retailers";
import { categories } from "../src/lib/config";
import type { AnyProduct } from "../src/types/products";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL no está configurada. Define la variable antes de sembrar la base de datos.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const CATEGORY_MAP: Record<string, Category> = {
  phone: "PHONE",
  laptop: "LAPTOP",
  cpu: "CPU",
  gpu: "GPU",
};

const CONFIDENCE_MAP: Record<string, Confidence> = {
  verified: "VERIFIED",
  reported: "REPORTED",
  estimated: "ESTIMATED",
  demo: "DEMO",
};

async function seedBrands() {
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      create: {
        slug: brand.slug,
        name: brand.name,
        country: brand.country,
        website: brand.website,
      },
      update: { name: brand.name, country: brand.country, website: brand.website },
    });
  }
  console.log(`Marcas: ${brands.length}`);
}

async function seedCategories() {
  for (const category of Object.values(categories)) {
    await prisma.categoryInfo.upsert({
      where: { key: CATEGORY_MAP[category.key] },
      create: {
        key: CATEGORY_MAP[category.key],
        slug: category.slug,
        name: category.label,
        description: category.description,
        seoTitle: category.seoTitle,
      },
      update: { slug: category.slug, name: category.label, description: category.description },
    });
  }
}

async function seedRetailers() {
  for (const retailer of retailers) {
    await prisma.retailer.upsert({
      where: { slug: retailer.slug },
      create: {
        slug: retailer.slug,
        name: retailer.name,
        country: retailer.country,
        website: retailer.website,
        integration: retailer.integration,
      },
      update: { name: retailer.name, website: retailer.website },
    });
  }
  console.log(`Tiendas: ${retailers.length}`);
}

async function upsertProduct(product: AnyProduct) {
  const brand = await prisma.brand.findUnique({ where: { slug: product.brandSlug } });
  if (!brand) throw new Error(`Marca no encontrada: ${product.brandSlug}`);

  const category = CATEGORY_MAP[product.category];

  const base = {
    name: product.name,
    model: product.model,
    description: product.description,
    image: product.image,
    releaseYear: product.releaseYear,
    productUrl: product.productUrl,
    referencePrice: product.referencePrice > 0 ? product.referencePrice : null,
    referenceCurrency: product.referenceCurrency,
    popularity: product.popularity,
    performanceScore: product.performanceScore,
    source: product.provenance.source,
    sourceLabel: product.provenance.sourceLabel,
    sourceUrl: product.provenance.sourceUrl,
    confidence: CONFIDENCE_MAP[product.provenance.confidence],
    lastUpdated: new Date(product.provenance.lastUpdated),
    brandId: brand.id,
  };

  const record = await prisma.product.upsert({
    where: { category_slug: { category, slug: product.slug } },
    create: { slug: product.slug, category, ...base },
    update: base,
  });

  return record.id;
}

async function seedPhones() {
  for (const phone of phones) {
    const productId = await upsertProduct(phone);
    const { scores, ...specs } = phone.specs;
    const data = { ...specs, scores };
    await prisma.phone.upsert({
      where: { productId },
      create: { productId, ...data },
      update: data,
    });
  }
  console.log(`Celulares: ${phones.length}`);
}

async function seedLaptops() {
  for (const laptop of laptops) {
    const productId = await upsertProduct(laptop);
    const { scores, ...specs } = laptop.specs;
    const data = { ...specs, scores };
    await prisma.laptop.upsert({
      where: { productId },
      create: { productId, ...data },
      update: data,
    });
  }
  console.log(`Laptops: ${laptops.length}`);
}

async function seedCpus() {
  for (const cpu of cpus) {
    const productId = await upsertProduct(cpu);
    const { scores, gaming, productivity, ...specs } = cpu.specs;
    void gaming;
    void productivity;
    const data = { ...specs, scores };
    await prisma.cpu.upsert({
      where: { productId },
      create: { productId, ...data },
      update: data,
    });
  }
  console.log(`Procesadores: ${cpus.length}`);
}

async function seedGpus() {
  for (const gpu of gpus) {
    const productId = await upsertProduct(gpu);
    const { scores, productivity, ...specs } = gpu.specs;
    void productivity;
    const data = { ...specs, scores };
    await prisma.gpu.upsert({
      where: { productId },
      create: { productId, ...data },
      update: data,
    });
  }
  console.log(`GPUs: ${gpus.length}`);
}

async function seedOffersAndPrices() {
  let offerCount = 0;
  let pricePoints = 0;

  for (const product of allProducts) {
    const category = CATEGORY_MAP[product.category];
    const record = await prisma.product.findUnique({
      where: { category_slug: { category, slug: product.slug } },
      select: { id: true },
    });
    if (!record) continue;

    for (const offer of buildOffers(product)) {
      const retailer = await prisma.retailer.findUnique({ where: { slug: offer.retailer.slug } });
      if (!retailer) continue;

      await prisma.productOffer.upsert({
        where: {
          productId_retailerId_externalId: {
            productId: record.id,
            retailerId: retailer.id,
            externalId: offer.id,
          },
        },
        create: {
          productId: record.id,
          retailerId: retailer.id,
          externalId: offer.id,
          originalPrice: offer.originalPrice,
          originalCurrency: offer.originalCurrency,
          availability:
            offer.availability === "in_stock"
              ? "IN_STOCK"
              : offer.availability === "out_of_stock"
                ? "OUT_OF_STOCK"
                : offer.availability === "preorder"
                  ? "PREORDER"
                  : "UNKNOWN",
          productUrl: offer.productUrl,
          shippingNote: offer.shippingNote,
          source: "demo-seed",
          confidence: "DEMO",
          lastUpdated: new Date(offer.lastUpdated),
        },
        update: {
          originalPrice: offer.originalPrice,
          lastUpdated: new Date(offer.lastUpdated),
        },
      });
      offerCount += 1;
    }

    const history = buildPriceHistory(product);
    if (history.points.length > 0) {
      await prisma.priceHistory.deleteMany({ where: { productId: record.id } });
      await prisma.priceHistory.createMany({
        data: history.points.map((point) => ({
          productId: record.id,
          price: point.price,
          currency: point.currency,
          timestamp: new Date(point.timestamp),
        })),
      });
      pricePoints += history.points.length;
    }

    await prisma.countryAvailability.deleteMany({ where: { productId: record.id } });
    await prisma.countryAvailability.createMany({
      data: product.availableIn.map((country) => ({
        productId: record.id,
        country,
        available: true,
        availability: "UNKNOWN" as const,
      })),
    });
  }

  console.log(`Ofertas: ${offerCount} | Puntos de precio: ${pricePoints}`);
}

async function main() {
  console.log("Sembrando catálogo inicial de TechCompare...");
  await seedBrands();
  await seedCategories();
  await seedRetailers();
  await seedPhones();
  await seedLaptops();
  await seedCpus();
  await seedGpus();
  await seedOffersAndPrices();
  console.log(`Listo. Productos totales: ${allProducts.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
