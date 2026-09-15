import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { fingerprint, groupDuplicates, similarity } from "../src/lib/normalization/dedupe";
import { normalizeProduct } from "../src/lib/normalization/normalizer";
import { normalizeSpecKey } from "../src/lib/normalization/spec-aliases";
import {
  toGigabytes,
  toGrams,
  toMegapixels,
  toMilliampHours,
  toBoolean,
  normalizeCurrency,
} from "../src/lib/normalization/units";
import { parseCsv, parseXmlItems, parseJsonItems } from "../src/lib/providers/feeds/parsers";

describe("diccionario de especificaciones", () => {
  test("reconoce los sinónimos de RAM de distintos proveedores", () => {
    for (const alias of ["RAM", "memory", "ram_size", "Memoria RAM", "ram size"]) {
      assert.equal(normalizeSpecKey(alias), "ram");
    }
  });

  test("reconoce almacenamiento en varios idiomas y formatos", () => {
    assert.equal(normalizeSpecKey("Almacenamiento"), "storage");
    assert.equal(normalizeSpecKey("internal-storage"), "storage");
    assert.equal(normalizeSpecKey("g:storage"), "storage");
  });

  test("devuelve null para claves desconocidas", () => {
    assert.equal(normalizeSpecKey("campo_raro_del_proveedor"), null);
  });
});

describe("conversión de unidades", () => {
  test("memoria a gigabytes", () => {
    assert.equal(toGigabytes("8GB"), 8);
    assert.equal(toGigabytes("8192 MB"), 8);
    assert.equal(toGigabytes("1 TB"), 1024);
    assert.equal(toGigabytes(12), 12);
  });

  test("batería a miliamperios-hora", () => {
    assert.equal(toMilliampHours("5000 mAh"), 5000);
    assert.equal(toMilliampHours("5 Ah"), 5000);
  });

  test("peso a gramos", () => {
    assert.equal(toGrams("189 g"), 189);
    assert.equal(toGrams("1.24 kg"), 1240);
  });

  test("cámara: toma el sensor de mayor resolución", () => {
    assert.equal(toMegapixels("50 MP + 8 MP + 2 MP"), 50);
    assert.equal(toMegapixels("200MP"), 200);
  });

  test("booleanos en español e inglés", () => {
    assert.equal(toBoolean("sí"), true);
    assert.equal(toBoolean("No"), false);
    assert.equal(toBoolean("quizá"), null);
  });

  test("moneda a partir de símbolo o código", () => {
    assert.equal(normalizeCurrency("1200 BOB"), "BOB");
    assert.equal(normalizeCurrency("US$ 300"), "USD");
    assert.equal(normalizeCurrency("300 €"), "EUR");
  });
});

describe("normalizador de producto", () => {
  test("unifica claves heterogéneas y conserva la trazabilidad", () => {
    const normalized = normalizeProduct({
      externalId: "abc-123",
      provider: "retailer-demo",
      name: "Smartphone Galaxy Demo 8/256",
      brand: "Samsung",
      specifications: {
        RAM: "8 GB",
        ram_size: "12 GB",
        Almacenamiento: "256GB",
        "Battery Capacity": "5000 mAh",
        color: "Negro",
        campo_desconocido: "valor",
      },
      price: 3200,
      currency: "BOB",
      availability: "Disponible",
      sourceUrl: "https://example.com/p/abc-123",
    });

    assert.equal(normalized.specs.ram, 8, "gana la primera clave reconocida");
    assert.equal(normalized.specs.storage, 256);
    assert.equal(normalized.specs.battery, 5000);
    assert.equal(normalized.availability, "in_stock");
    assert.equal(normalized.category, "phone");
    assert.equal(normalized.confidence, "reported");
    assert.deepEqual(normalized.unmappedSpecs, { campo_desconocido: "valor" });
    assert.equal(normalized.sourceUrl, "https://example.com/p/abc-123");
  });

  test("descarta imágenes que no son URLs absolutas", () => {
    const normalized = normalizeProduct({
      externalId: "x",
      provider: "p",
      name: "Laptop Demo",
      images: ["/relativa.jpg", "https://cdn.example.com/a.jpg"],
      specifications: {},
    });
    assert.deepEqual(normalized.images, ["https://cdn.example.com/a.jpg"]);
  });
});

describe("detección de duplicados entre tiendas", () => {
  test("la huella ignora palabras de relleno del título comercial", () => {
    const a = fingerprint("Notebook ASUS ROG Zephyrus G16 32GB RAM", "ASUS");
    const b = fingerprint("ASUS ROG Zephyrus G16 (2025)", "Asus");
    assert.ok(similarity(a, b) >= 0.6, `similitud insuficiente: ${similarity(a, b)}`);
  });

  test("agrupa la misma laptop publicada por tres tiendas", () => {
    const base = { provider: "p", specifications: {} };
    const items = [
      { ...base, externalId: "1", name: "ASUS ROG Zephyrus G16" },
      { ...base, externalId: "2", name: "Asus ROG Zephyrus G16 sellado" },
      { ...base, externalId: "3", name: "Lenovo Legion Pro 5" },
    ].map((item) => normalizeProduct(item));

    const groups = groupDuplicates(items, 0.6);
    assert.equal(groups.length, 2);
    assert.equal(groups[0].length, 2);
  });
});

describe("parsers de feeds de tienda", () => {
  test("CSV con comillas y comas dentro del campo", () => {
    const rows = parseCsv('id,title,price\n1,"Laptop, 16GB",7999\n2,Mouse,120\n');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].title, "Laptop, 16GB");
    assert.equal(rows[1].price, "120");
  });

  test("XML estilo Google Merchant", () => {
    const xml = `<rss><channel>
      <item><g:id>A1</g:id><g:title>Celular Demo</g:title><g:price>2500 BOB</g:price></item>
      <item><g:id>A2</g:id><g:title><![CDATA[Laptop & Co]]></g:title></item>
    </channel></rss>`;
    const items = parseXmlItems(xml);
    assert.equal(items.length, 2);
    assert.equal(items[0].title, "Celular Demo");
    assert.equal(items[1].title, "Laptop & Co");
  });

  test("JSON envuelto en la clave products", () => {
    const items = parseJsonItems('{"products":[{"id":1},{"id":2}]}');
    assert.equal(items.length, 2);
  });
});
