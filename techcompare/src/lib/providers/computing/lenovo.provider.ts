import { createBrandProvider } from "../brand-provider.factory";

export const lenovoProvider = createBrandProvider({
  id: "lenovo",
  name: "Lenovo",
  categories: ["laptop"],
  docsUrl: "https://www.lenovo.com/",
  complianceNote:
    "Sin API pública de catálogo. Preparado para feed de distribuidor autorizado.",
  requiredEnv: ["LENOVO_API_KEY"],
});
