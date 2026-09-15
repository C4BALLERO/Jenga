import { createBrandProvider } from "../brand-provider.factory";

export const msiProvider = createBrandProvider({
  id: "msi",
  name: "MSI",
  categories: ["laptop", "gpu"],
  docsUrl: "https://www.msi.com/",
  complianceNote:
    "Sin API pública de catálogo. Pendiente de feed autorizado.",
  requiredEnv: ["MSI_API_KEY"],
});
