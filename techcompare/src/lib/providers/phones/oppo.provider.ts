import { createBrandProvider } from "../brand-provider.factory";

export const oppoPhoneProvider = createBrandProvider({
  id: "oppo-phones",
  name: "OPPO",
  categories: ["phone"],
  docsUrl: "https://open.oppomobile.com/",
  complianceNote:
    "Plataforma orientada a apps, no a catálogo de producto. Pendiente de feed autorizado.",
  requiredEnv: ["OPPO_API_KEY"],
});
