import { createBrandProvider } from "../brand-provider.factory";

export const samsungPhoneProvider = createBrandProvider({
  id: "samsung-phones",
  name: "Samsung (smartphones)",
  categories: ["phone"],
  docsUrl: "https://developer.samsung.com/",
  complianceNote:
    "Samsung Developers expone APIs de plataforma, no un catálogo comercial público. Requiere acuerdo de partner o feed autorizado antes de activar.",
  requiredEnv: ["SAMSUNG_API_KEY"],
});
