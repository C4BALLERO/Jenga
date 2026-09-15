import { createBrandProvider } from "../brand-provider.factory";

export const onePlusPhoneProvider = createBrandProvider({
  id: "oneplus-phones",
  name: "OnePlus",
  categories: ["phone"],
  docsUrl: "https://www.oneplus.com/",
  complianceNote:
    "Sin API pública de catálogo. Pendiente de feed autorizado.",
  requiredEnv: ["ONEPLUS_API_KEY"],
});
