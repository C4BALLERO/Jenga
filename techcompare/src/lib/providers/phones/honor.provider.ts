import { createBrandProvider } from "../brand-provider.factory";

export const honorPhoneProvider = createBrandProvider({
  id: "honor-phones",
  name: "HONOR",
  categories: ["phone"],
  docsUrl: "https://developer.honor.com/",
  complianceNote:
    "HONOR Developer cubre servicios de dispositivo, no catálogo comercial. Pendiente de acuerdo de datos.",
  requiredEnv: ["HONOR_API_KEY"],
});
