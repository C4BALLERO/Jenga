import { createBrandProvider } from "../brand-provider.factory";

export const googlePhoneProvider = createBrandProvider({
  id: "google-phones",
  name: "Google (Pixel)",
  categories: ["phone"],
  docsUrl: "https://developers.google.com/",
  complianceNote:
    "Google no ofrece API pública del catálogo de Google Store. Alternativa autorizada: Google Merchant Center feeds del retailer.",
  requiredEnv: ["GOOGLE_STORE_API_KEY"],
});
