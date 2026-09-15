import { createBrandProvider } from "../brand-provider.factory";

export const hpProvider = createBrandProvider({
  id: "hp",
  name: "HP",
  categories: ["laptop"],
  docsUrl: "https://developers.hp.com/",
  complianceNote:
    "HP Developers cubre impresión y dispositivos; no catálogo comercial. Pendiente de acuerdo de datos.",
  requiredEnv: ["HP_API_KEY"],
});
