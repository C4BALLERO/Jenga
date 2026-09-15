import { createBrandProvider } from "../brand-provider.factory";

export const gigabyteProvider = createBrandProvider({
  id: "gigabyte",
  name: "GIGABYTE",
  categories: ["laptop", "gpu"],
  docsUrl: "https://www.gigabyte.com/",
  complianceNote:
    "Sin API pública de catálogo. Pendiente de feed autorizado.",
  requiredEnv: ["GIGABYTE_API_KEY"],
});
