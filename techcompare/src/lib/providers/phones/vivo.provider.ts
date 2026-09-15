import { createBrandProvider } from "../brand-provider.factory";

export const vivoPhoneProvider = createBrandProvider({
  id: "vivo-phones",
  name: "vivo",
  categories: ["phone"],
  docsUrl: "https://dev.vivo.com/",
  complianceNote:
    "Sin API pública de catálogo verificada. Preparado para importación autorizada.",
  requiredEnv: ["VIVO_API_KEY"],
});
