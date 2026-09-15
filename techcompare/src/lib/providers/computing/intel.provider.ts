import { createBrandProvider } from "../brand-provider.factory";

export const intelProvider = createBrandProvider({
  id: "intel",
  name: "Intel",
  categories: ["cpu", "gpu"],
  docsUrl: "https://odata.intel.com/",
  complianceNote:
    "Intel sí publica especificaciones de forma programática: el servicio OData de ARK (odata.intel.com) y el portal de API de producto (api-portal.intel.com), que exige registro. Es la integración de fabricante más viable a corto plazo. Pendiente de credenciales; nunca se hace scraping de ark.intel.com.",
  requiredEnv: ["INTEL_API_KEY"],
});
