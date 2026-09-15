import { createFeedProvider, type FeedProvider } from "../feeds/feed.provider";

/**
 * Tiendas de Bolivia y la región integradas mediante feed autorizado.
 *
 * Ninguna de estas tiendas publica hoy una API abierta verificada. El camino
 * previsto es el habitual con comercios locales: la tienda entrega un catálogo
 * periódico (CSV/XML/JSON) y aquí solo se configura su URL en una variable de
 * entorno. Mientras no exista esa URL, el proveedor está `not_configured` y no
 * realiza ninguna petición.
 */
export const boliviaRetailerProviders: FeedProvider[] = [
  createFeedProvider({
    id: "retailer-bo-a",
    name: "Tienda Bolivia A (feed autorizado)",
    categories: ["phone", "laptop"],
    countries: ["BO"],
    urlEnv: "RETAILER_BO_A_FEED_URL",
    tokenEnv: "RETAILER_BO_A_TOKEN",
    complianceNote:
      "Integración por catálogo cedido. Requiere autorización escrita de la tienda y una URL de feed estable. Sin scraping.",
    priceMinutes: 180,
  }),
  createFeedProvider({
    id: "retailer-bo-b",
    name: "Tienda Bolivia B (feed autorizado)",
    categories: ["phone", "laptop", "cpu", "gpu"],
    countries: ["BO"],
    urlEnv: "RETAILER_BO_B_FEED_URL",
    complianceNote:
      "Integración por catálogo cedido en CSV. Requiere autorización de la tienda. Sin scraping.",
    format: "csv",
    priceMinutes: 360,
  }),
  createFeedProvider({
    id: "retailer-latam-merchant",
    name: "Feed Google Merchant (LatAm)",
    categories: ["phone", "laptop", "cpu", "gpu"],
    countries: ["BO", "PE", "CL", "AR", "CO", "MX"],
    urlEnv: "RETAILER_MERCHANT_FEED_URL",
    format: "xml",
    itemTag: "item",
    complianceNote:
      "Feed estándar de Google Merchant Center cedido por el comercio. Formato XML con prefijo g:. Requiere que la tienda comparta la URL.",
    priceMinutes: 240,
  }),
];
