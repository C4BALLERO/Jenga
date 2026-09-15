import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { allProducts, cpus, gpus, laptops, phones } from "../src/data/catalog";
import type { Gpu, Phone } from "../src/types/products";
import { buildOffers, buildPriceHistory, priceInsight } from "../src/data/offers";
import { buildComparisonTable, buildVerdict, parseCompareSlug, suggestComparisons } from "../src/lib/compare/compare";
import { parseCatalogQuery } from "../src/lib/catalog/query-params";
import { filterProducts } from "../src/lib/repositories/catalog.repository";
import { buildFacets } from "../src/lib/repositories/facets";
import { publishableCollections, rankCollection } from "../src/lib/repositories/collections.repository";
import { collections } from "../src/data/collections";

describe("catálogo derivado", () => {
  test("todos los productos tienen slug único dentro de su categoría", () => {
    const seen = new Set<string>();
    for (const product of allProducts) {
      const key = `${product.category}:${product.slug}`;
      assert.ok(!seen.has(key), `slug duplicado: ${key}`);
      seen.add(key);
    }
  });

  test("las puntuaciones derivadas quedan en el rango 0-100", () => {
    for (const product of allProducts) {
      assert.ok(
        product.performanceScore >= 0 && product.performanceScore <= 100,
        `${product.name}: rendimiento fuera de rango (${product.performanceScore})`,
      );
      const scores = (product.specs as unknown as { scores: Record<string, number> }).scores;
      for (const [key, value] of Object.entries(scores)) {
        assert.ok(
          value >= 0 && value <= 100,
          `${product.name}: ${key} fuera de rango (${value})`,
        );
      }
    }
  });

  test("el catálogo inicial se marca como dato no verificado", () => {
    for (const product of allProducts) {
      assert.equal(product.provenance.confidence, "demo");
    }
  });

  test("hay volumen suficiente en las cuatro categorías", () => {
    assert.ok(phones.length >= 12);
    assert.ok(laptops.length >= 8);
    assert.ok(cpus.length >= 8);
    assert.ok(gpus.length >= 8);
  });

  test("un procesador con mejor multi-core puntúa más en productividad", () => {
    const sorted = [...cpus].sort((a, b) => b.specs.multiCore - a.specs.multiCore);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    assert.ok(best.specs.scores.productivity > worst.specs.scores.productivity);
  });
});

describe("filtros de catálogo", () => {
  test("el filtro de RAM mínima excluye los equipos por debajo", () => {
    const query = parseCatalogQuery({ ram_min: "12" }, "phone");
    const result = filterProducts(phones, query);
    assert.ok(result.length > 0);
    assert.ok((result as Phone[]).every((product) => product.specs.ram >= 12));
  });

  test("el filtro de TDP funciona como máximo, no como mínimo", () => {
    const query = parseCatalogQuery({ tdp_min: "150" }, "gpu");
    const result = filterProducts(gpus, query);
    assert.ok(result.length > 0);
    assert.ok((result as Gpu[]).every((product) => product.specs.tdp <= 150));
  });

  test("combinar marca y precio reduce el resultado", () => {
    const query = parseCatalogQuery({ brand: "Samsung", maxPrice: "4000" }, "phone");
    const result = filterProducts(phones, query);
    assert.ok(result.length > 0);
    assert.ok(result.every((product) => product.brandName === "Samsung"));
    assert.ok(result.every((product) => product.referencePrice <= 4000));
  });

  test("la búsqueda por texto encuentra por procesador", () => {
    const query = parseCatalogQuery({ q: "snapdragon" }, "phone");
    const result = filterProducts(phones, query);
    assert.ok(result.length > 0);
  });

  test("un filtro imposible devuelve lista vacía sin fallar", () => {
    const query = parseCatalogQuery({ ram_min: "999" }, "phone");
    assert.equal(filterProducts(phones, query).length, 0);
  });

  test("las facetas solo ofrecen opciones con resultados", () => {
    const facets = buildFacets("phone", phones);
    for (const facet of facets) {
      for (const option of facet.options ?? []) {
        assert.ok(option.count > 0, `${facet.key}/${option.value} sin resultados`);
      }
    }
  });
});

describe("comparador", () => {
  test("parsea el slug compartible", () => {
    assert.deepEqual(parseCompareSlug("iphone-17-vs-galaxy-s26"), ["iphone-17", "galaxy-s26"]);
  });

  test("la tabla marca un único ganador por fila numérica", () => {
    const [a, b] = [phones[0], phones[1]];
    const groups = buildComparisonTable([a, b]);
    assert.ok(groups.length > 0);

    for (const group of groups) {
      for (const row of group.rows) {
        if (row.winner !== null) assert.ok(row.winner === 0 || row.winner === 1);
      }
    }
  });

  test("el veredicto elige ganador y explica el porqué", () => {
    const top = [...phones].sort((a, b) => b.performanceScore - a.performanceScore);
    const verdict = buildVerdict([top[0], top[top.length - 1]]);
    assert.ok(verdict);
    assert.equal(verdict.overallWinner, 0, "debería ganar el de mayor rendimiento");
    assert.ok(verdict.paragraphs.length >= 2);
    assert.equal(verdict.recommendations.length, 2);
  });

  test("admite comparar tres productos", () => {
    const groups = buildComparisonTable(phones.slice(0, 3));
    assert.ok(groups[0].rows[0].c !== undefined);
  });

  test("solo sugiere duelos entre equipos de nivel parecido", () => {
    for (const [a, b] of suggestComparisons(phones, 10)) {
      assert.ok(Math.abs(a.performanceScore - b.performanceScore) <= 18);
    }
  });
});

describe("ofertas e historial de precios", () => {
  test("las ofertas se ordenan de más barata a más cara", () => {
    const offers = buildOffers(phones[0]);
    assert.ok(offers.length >= 2);
    for (let i = 1; i < offers.length; i += 1) {
      assert.ok(offers[i].originalPrice >= offers[i - 1].originalPrice);
    }
  });

  test("el historial es determinista entre ejecuciones", () => {
    const a = buildPriceHistory(phones[0]);
    const b = buildPriceHistory(phones[0]);
    assert.deepEqual(a.points, b.points);
  });

  test("el resumen de precio no contradice la serie", () => {
    const insight = priceInsight(buildPriceHistory(phones[0]));
    assert.ok(insight);
    assert.ok(insight.lowest <= insight.current);
    assert.ok(insight.highest >= insight.current);
  });

  test("un producto sin precio no genera ofertas", () => {
    const soc = cpus.find((cpu) => cpu.referencePrice === 0);
    assert.ok(soc);
    assert.equal(buildOffers(soc).length, 0);
  });
});

describe("colecciones de SEO programático", () => {
  test("no se publica una colección sin contenido suficiente", () => {
    for (const collection of publishableCollections()) {
      assert.ok(rankCollection(collection).length >= 3, collection.slug);
    }
  });

  test("las colecciones con tope de precio lo respetan", () => {
    for (const collection of collections.filter((item) => item.maxPrice)) {
      for (const entry of rankCollection(collection)) {
        assert.ok(
          entry.product.referencePrice <= (collection.maxPrice as number),
          `${collection.slug}: ${entry.product.name} excede el tope`,
        );
      }
    }
  });

  test("cada colección aporta criterios y preguntas frecuentes", () => {
    for (const collection of collections) {
      assert.ok(collection.criteria.length >= 2, collection.slug);
      assert.ok(collection.faq.length >= 2, collection.slug);
      assert.ok(collection.intro.length > 120, collection.slug);
    }
  });

  test("el ranking está ordenado de mayor a menor puntuación", () => {
    for (const collection of publishableCollections()) {
      const ranked = rankCollection(collection);
      for (let i = 1; i < ranked.length; i += 1) {
        assert.ok(ranked[i - 1].score >= ranked[i].score, collection.slug);
      }
    }
  });
});
