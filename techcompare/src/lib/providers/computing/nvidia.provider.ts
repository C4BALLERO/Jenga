import { createBrandProvider } from "../brand-provider.factory";

export const nvidiaProvider = createBrandProvider({
  id: "nvidia",
  name: "NVIDIA",
  categories: ["gpu", "laptop"],
  docsUrl: "https://developer.nvidia.com/",
  complianceNote:
    "NVIDIA Developer expone SDKs; no hay API pública documentada de catálogo de GPUs con especificaciones. Integración prevista por feed autorizado o carga manual verificada.",
  requiredEnv: ["NVIDIA_API_KEY"],
});
