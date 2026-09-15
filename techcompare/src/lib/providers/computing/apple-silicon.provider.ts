import { createBrandProvider } from "../brand-provider.factory";

export const appleSiliconProvider = createBrandProvider({
  id: "apple-silicon",
  name: "Apple Silicon",
  categories: ["cpu", "laptop"],
  docsUrl: "https://developer.apple.com/documentation/",
  complianceNote:
    "Sin API pública de especificaciones. Datos pendientes de fuente oficial verificable.",
  requiredEnv: ["APPLE_API_KEY"],
});
