import { createBrandProvider } from "../brand-provider.factory";

export const dellProvider = createBrandProvider({
  id: "dell",
  name: "Dell",
  categories: ["laptop"],
  docsUrl: "https://developer.dell.com/",
  complianceNote:
    "Dell expone APIs de soporte/garantía previa autorización; no catálogo abierto de especificaciones. Pendiente de credenciales.",
  requiredEnv: ["DELL_API_KEY"],
});
