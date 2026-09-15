import { createBrandProvider } from "../brand-provider.factory";

export const motorolaPhoneProvider = createBrandProvider({
  id: "motorola-phones",
  name: "Motorola / Lenovo Mobile",
  categories: ["phone"],
  docsUrl: "https://developer.motorola.com/",
  complianceNote:
    "Sin API pública de catálogo verificada. Preparado para feed de distribuidor o programa de afiliados.",
  requiredEnv: ["MOTOROLA_API_KEY"],
});
