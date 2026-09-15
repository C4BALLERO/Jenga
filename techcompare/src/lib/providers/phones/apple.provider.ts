import { createBrandProvider } from "../brand-provider.factory";

export const applePhoneProvider = createBrandProvider({
  id: "apple-phones",
  name: "Apple (smartphones)",
  categories: ["phone"],
  docsUrl: "https://developer.apple.com/documentation/",
  complianceNote:
    "Apple no publica una API abierta de catálogo con especificaciones. Vía autorizada: programa de afiliados / feeds de partner. Proveedor listo para conectar; sin credenciales no realiza peticiones.",
  requiredEnv: ["APPLE_API_KEY"],
});
