import { createBrandProvider } from "../brand-provider.factory";

export const amdProvider = createBrandProvider({
  id: "amd",
  name: "AMD",
  categories: ["cpu", "gpu"],
  docsUrl: "https://www.amd.com/en/developer.html",
  complianceNote:
    "Sin API pública de catálogo de producto. Preparado para importación autorizada o feed de partner.",
  requiredEnv: ["AMD_API_KEY"],
});
