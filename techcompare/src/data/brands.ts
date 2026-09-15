import type { Brand } from "@/types/common";

export const brands: Brand[] = [
  { slug: "apple", name: "Apple", country: "US", website: "https://www.apple.com", categories: ["phone", "laptop", "cpu"] },
  { slug: "samsung", name: "Samsung", country: "KR", website: "https://www.samsung.com", categories: ["phone"] },
  { slug: "xiaomi", name: "Xiaomi", country: "CN", website: "https://www.mi.com", categories: ["phone"] },
  { slug: "google", name: "Google", country: "US", website: "https://store.google.com", categories: ["phone"] },
  { slug: "motorola", name: "Motorola", country: "US", website: "https://www.motorola.com", categories: ["phone"] },
  { slug: "oneplus", name: "OnePlus", country: "CN", website: "https://www.oneplus.com", categories: ["phone"] },
  { slug: "honor", name: "HONOR", country: "CN", website: "https://www.honor.com", categories: ["phone"] },
  { slug: "oppo", name: "OPPO", country: "CN", website: "https://www.oppo.com", categories: ["phone"] },
  { slug: "vivo", name: "vivo", country: "CN", website: "https://www.vivo.com", categories: ["phone"] },
  { slug: "realme", name: "realme", country: "CN", website: "https://www.realme.com", categories: ["phone"] },
  { slug: "asus", name: "ASUS", country: "TW", website: "https://www.asus.com", categories: ["laptop", "gpu"] },
  { slug: "lenovo", name: "Lenovo", country: "CN", website: "https://www.lenovo.com", categories: ["laptop"] },
  { slug: "hp", name: "HP", country: "US", website: "https://www.hp.com", categories: ["laptop"] },
  { slug: "dell", name: "Dell", country: "US", website: "https://www.dell.com", categories: ["laptop"] },
  { slug: "acer", name: "Acer", country: "TW", website: "https://www.acer.com", categories: ["laptop"] },
  { slug: "msi", name: "MSI", country: "TW", website: "https://www.msi.com", categories: ["laptop", "gpu"] },
  { slug: "intel", name: "Intel", country: "US", website: "https://www.intel.com", categories: ["cpu", "gpu"] },
  { slug: "amd", name: "AMD", country: "US", website: "https://www.amd.com", categories: ["cpu", "gpu"] },
  { slug: "nvidia", name: "NVIDIA", country: "US", website: "https://www.nvidia.com", categories: ["gpu"] },
  { slug: "qualcomm", name: "Qualcomm", country: "US", website: "https://www.qualcomm.com", categories: ["cpu"] },
  { slug: "microsoft", name: "Microsoft", country: "US", website: "https://www.microsoft.com", categories: ["laptop"] },
];

export const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

export function brandName(slug: string): string {
  return brandBySlug.get(slug)?.name ?? slug;
}
