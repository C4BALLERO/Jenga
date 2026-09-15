import { createBrandProvider } from "../brand-provider.factory";

export const acerProvider = createBrandProvider({
  id: "acer",
  name: "Acer",
  categories: ["laptop"],
  docsUrl: "https://www.acer.com/",
  complianceNote:
    "Sin API pública de catálogo verificada. Pendiente de feed autorizado.",
  requiredEnv: ["ACER_API_KEY"],
});
