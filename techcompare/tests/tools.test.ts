import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  DEFAULT_STORAGE_INPUT,
  calculateStorage,
  parseStorageInput,
  storageInputToParams,
} from "../src/lib/calculator/storage";
import {
  answersToParams,
  defaultAnswers,
  parseAnswers,
  recommendPhones,
} from "../src/lib/recommend/engine";
import { convertStatic } from "../src/lib/currency/exchange";
import { formatMoney } from "../src/lib/currency/format";
import { sanitizeInteger, sanitizeSlug, sanitizeText, serializeJsonLd } from "../src/lib/security/sanitize";
import { rateLimit } from "../src/lib/security/rate-limit";

describe("calculadora de almacenamiento", () => {
  test("más vídeo en 4K exige más espacio", () => {
    const base = calculateStorage({ ...DEFAULT_STORAGE_INPUT, videoQuality: "1080p30" });
    const heavy = calculateStorage({ ...DEFAULT_STORAGE_INPUT, videoQuality: "4k60" });
    assert.ok(heavy.totalGb > base.totalGb * 2);
  });

  test("recomienda una capacidad del catálogo habitual", () => {
    const result = calculateStorage(DEFAULT_STORAGE_INPUT);
    assert.ok([128, 256, 512, 1024].includes(result.recommended));
  });

  test("la capacidad utilizable es menor que la anunciada", () => {
    const result = calculateStorage(DEFAULT_STORAGE_INPUT);
    for (const option of result.options) {
      assert.ok(option.usableGb < option.capacity);
    }
  });

  test("un uso mínimo cabe en 128 GB", () => {
    const result = calculateStorage({
      photosPerMonth: 10,
      videoMinutesPerMonth: 0,
      videoQuality: "1080p30",
      apps: 20,
      games: 0,
      songs: 0,
      documents: 10,
      messaging: "light",
      years: 1,
    });
    assert.equal(result.recommended, 128);
  });

  test("un uso intenso durante años no cabe en 128 GB", () => {
    const result = calculateStorage({
      photosPerMonth: 800,
      videoMinutesPerMonth: 200,
      videoQuality: "4k60",
      apps: 150,
      games: 20,
      songs: 3000,
      documents: 2000,
      messaging: "heavy",
      years: 5,
    });
    const smallest = result.options.find((option) => option.capacity === 128);
    assert.equal(smallest?.verdict, "insuficiente");
  });

  test("las entradas fuera de rango se acotan en lugar de romper", () => {
    const result = calculateStorage({ ...DEFAULT_STORAGE_INPUT, years: 99, photosPerMonth: -5 });
    assert.ok(result.totalGb > 0);
    assert.ok(Number.isFinite(result.totalGb));
  });

  test("el resultado viaja íntegro en la URL", () => {
    const params = storageInputToParams(DEFAULT_STORAGE_INPUT);
    const flat = Object.fromEntries(params.entries());
    assert.deepEqual(parseStorageInput(flat), DEFAULT_STORAGE_INPUT);
  });
});

describe("recomendador de teléfonos", () => {
  test("respeta el sistema operativo elegido", () => {
    const answers = { ...defaultAnswers(), os: "iOS", budget: "99000" };
    for (const recommendation of recommendPhones(answers, 5)) {
      assert.equal(recommendation.phone.specs.os, "iOS");
    }
  });

  test("exige 5G cuando se marca como imprescindible", () => {
    const answers = { ...defaultAnswers(), network: "yes", budget: "99000" };
    for (const recommendation of recommendPhones(answers, 5)) {
      assert.equal(recommendation.phone.specs.fiveG, true);
    }
  });

  test("priorizar gaming cambia el primer recomendado", () => {
    const budget = "9000";
    const gamer = recommendPhones({ ...defaultAnswers(), budget, gaming: "3", photography: "0", mainUse: "gaming" }, 3);
    const photographer = recommendPhones({ ...defaultAnswers(), budget, gaming: "0", photography: "3", mainUse: "photo" }, 3);
    assert.ok(gamer.length > 0 && photographer.length > 0);
    assert.ok(gamer[0].phone.specs.scores.gaming >= photographer[0].phone.specs.scores.gaming);
  });

  test("las recomendaciones llegan ordenadas por compatibilidad", () => {
    const list = recommendPhones(defaultAnswers(), 5);
    for (let i = 1; i < list.length; i += 1) {
      assert.ok(list[i - 1].compatibility >= list[i].compatibility);
    }
  });

  test("cada recomendación explica al menos un motivo", () => {
    for (const recommendation of recommendPhones(defaultAnswers(), 5)) {
      assert.ok(recommendation.reasons.length >= 1);
      assert.ok(recommendation.compatibility >= 0 && recommendation.compatibility <= 100);
    }
  });

  test("las respuestas sobreviven al viaje de ida y vuelta por la URL", () => {
    const answers = { ...defaultAnswers(), budget: "2500", gaming: "3", os: "Android" };
    const parsed = parseAnswers(Object.fromEntries(answersToParams(answers).entries()));
    assert.deepEqual(parsed, answers);
  });

  test("un valor manipulado en la URL cae al valor por defecto", () => {
    const parsed = parseAnswers({ o: "<script>", p: "no-es-un-numero" });
    assert.equal(parsed.os, "any");
    assert.equal(parsed.budget, "4000");
  });
});

describe("moneda", () => {
  test("convierte dólares a bolivianos y vuelve al origen", () => {
    const bob = convertStatic(100, "USD", "BOB");
    assert.ok(bob > 100);
    assert.ok(Math.abs(convertStatic(bob, "BOB", "USD") - 100) < 0.001);
  });

  test("formatea en el estilo esperado en Bolivia", () => {
    assert.equal(formatMoney(4999, "BOB"), "Bs 4.999");
    assert.equal(formatMoney(1200, "USD"), "US$ 1.200");
  });
});

describe("saneamiento y límites", () => {
  test("elimina etiquetas y recorta la longitud", () => {
    assert.equal(sanitizeText("<script>alert(1)</script>"), "scriptalert(1)/script");
    assert.equal(sanitizeText("x".repeat(500)).length, 120);
  });

  test("solo acepta slugs con forma válida", () => {
    assert.equal(sanitizeSlug("iphone-17"), "iphone-17");
    assert.equal(sanitizeSlug("../../etc/passwd"), null);
    assert.equal(sanitizeSlug("Iphone 17"), null);
  });

  test("los enteros fuera de rango se rechazan", () => {
    assert.equal(sanitizeInteger("8", 0, 100), 8);
    assert.equal(sanitizeInteger("900", 0, 100), null);
    assert.equal(sanitizeInteger("abc", 0, 100), null);
  });

  test("el JSON-LD escapa el carácter que cerraría la etiqueta", () => {
    const output = serializeJsonLd({ name: "</script><img onerror=alert(1)>" });
    assert.ok(!output.includes("</script>"));
    assert.ok(output.includes("\\u003c"));
  });

  test("el limitador bloquea al superar la cuota", () => {
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 3; i += 1) assert.equal(rateLimit(key, 3).allowed, true);
    assert.equal(rateLimit(key, 3).allowed, false);
  });
});
