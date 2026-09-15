import { createBrandProvider } from "../brand-provider.factory";

export const xiaomiPhoneProvider = createBrandProvider({
  id: "xiaomi-phones",
  name: "Xiaomi",
  categories: ["phone"],
  docsUrl: "https://global.developer.mi.com/",
  complianceNote:
    "Sin API pública documentada de catálogo. Integración prevista mediante feed autorizado de distribuidor oficial.",
  requiredEnv: ["XIAOMI_API_KEY"],
});
