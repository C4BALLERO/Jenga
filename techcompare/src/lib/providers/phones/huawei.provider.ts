import { createBrandProvider } from "../brand-provider.factory";

export const huaweiPhoneProvider = createBrandProvider({
  id: "huawei-phones",
  name: "Huawei",
  categories: ["phone"],
  docsUrl: "https://developer.huawei.com/consumer/en/",
  complianceNote:
    "Huawei Developers ofrece HMS, no catálogo comercial. Pendiente de acuerdo de datos.",
  requiredEnv: ["HUAWEI_API_KEY"],
});
