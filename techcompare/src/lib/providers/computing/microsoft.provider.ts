import { createBrandProvider } from "../brand-provider.factory";

export const microsoftProvider = createBrandProvider({
  id: "microsoft",
  name: "Microsoft (Surface)",
  categories: ["laptop"],
  docsUrl: "https://learn.microsoft.com/",
  complianceNote:
    "Sin API pública de catálogo Surface con especificaciones. Pendiente de feed autorizado.",
  requiredEnv: ["MICROSOFT_API_KEY"],
});
