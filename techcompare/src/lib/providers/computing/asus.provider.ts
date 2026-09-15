import { createBrandProvider } from "../brand-provider.factory";

export const asusProvider = createBrandProvider({
  id: "asus",
  name: "ASUS",
  categories: ["laptop", "gpu"],
  docsUrl: "https://www.asus.com/",
  complianceNote:
    "Sin API pública de catálogo verificada. Pendiente de feed autorizado.",
  requiredEnv: ["ASUS_API_KEY"],
});
