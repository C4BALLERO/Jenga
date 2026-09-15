import type { ProductCategory } from "@/types/common";
import type {
  ProviderDescriptor,
  ProviderHealth,
  RawProviderProduct,
  SyncLogEntry,
  SyncStatus,
} from "@/types/providers";
import { normalizeMany, type NormalizedProduct } from "@/lib/normalization/normalizer";
import { demoSeedProvider } from "./demo-seed.provider";
import { amazonProvider } from "./retailers/amazon.provider";
import { boliviaRetailerProviders } from "./retailers/bolivia.providers";
import { mercadoLibreProvider } from "./retailers/mercadolibre.provider";
import { acerProvider } from "./computing/acer.provider";
import { amdProvider } from "./computing/amd.provider";
import { appleSiliconProvider } from "./computing/apple-silicon.provider";
import { asusProvider } from "./computing/asus.provider";
import { dellProvider } from "./computing/dell.provider";
import { gigabyteProvider } from "./computing/gigabyte.provider";
import { hpProvider } from "./computing/hp.provider";
import { intelProvider } from "./computing/intel.provider";
import { lenovoProvider } from "./computing/lenovo.provider";
import { microsoftProvider } from "./computing/microsoft.provider";
import { msiProvider } from "./computing/msi.provider";
import { nvidiaProvider } from "./computing/nvidia.provider";
import { applePhoneProvider } from "./phones/apple.provider";
import { googlePhoneProvider } from "./phones/google.provider";
import { honorPhoneProvider } from "./phones/honor.provider";
import { huaweiPhoneProvider } from "./phones/huawei.provider";
import { motorolaPhoneProvider } from "./phones/motorola.provider";
import { onePlusPhoneProvider } from "./phones/oneplus.provider";
import { oppoPhoneProvider } from "./phones/oppo.provider";
import { samsungPhoneProvider } from "./phones/samsung.provider";
import { vivoPhoneProvider } from "./phones/vivo.provider";
import { xiaomiPhoneProvider } from "./phones/xiaomi.provider";
import { ProductProvider, ProviderError } from "./provider.interface";
import {
  finishSync,
  getHealth,
  getLogs,
  isTemporarilyDisabled,
  recordHealth,
  startSync,
} from "./sync-store";

/**
 * Registro central de proveedores.
 *
 * Añadir una fuente nueva consiste en implementar `ProductProvider` y sumarla a
 * esta lista. Ni la interfaz, ni los repositorios, ni las páginas cambian.
 */
const PROVIDERS: ProductProvider[] = [
  demoSeedProvider,
  // Smartphones
  applePhoneProvider,
  samsungPhoneProvider,
  xiaomiPhoneProvider,
  motorolaPhoneProvider,
  googlePhoneProvider,
  onePlusPhoneProvider,
  honorPhoneProvider,
  oppoPhoneProvider,
  vivoPhoneProvider,
  huaweiPhoneProvider,
  // Computación
  nvidiaProvider,
  amdProvider,
  intelProvider,
  appleSiliconProvider,
  lenovoProvider,
  asusProvider,
  acerProvider,
  hpProvider,
  dellProvider,
  msiProvider,
  gigabyteProvider,
  microsoftProvider,
  // Tiendas y feeds
  mercadoLibreProvider,
  amazonProvider,
  ...boliviaRetailerProviders,
];

export class ProviderManager {
  private readonly providers = new Map<string, ProductProvider>();

  constructor(providers: ProductProvider[] = PROVIDERS) {
    for (const provider of providers) {
      this.providers.set(provider.descriptor.id, provider);
    }
  }

  list(): ProductProvider[] {
    return [...this.providers.values()];
  }

  descriptors(): ProviderDescriptor[] {
    return this.list().map((provider) => provider.descriptor);
  }

  get(id: string): ProductProvider | undefined {
    return this.providers.get(id);
  }

  /** Proveedores que hoy pueden operar (configurados y no pausados). */
  active(): ProductProvider[] {
    return this.list().filter(
      (provider) => provider.isConfigured() && !isTemporarilyDisabled(provider.descriptor.id),
    );
  }

  byCategory(category: ProductCategory): ProductProvider[] {
    return this.active().filter((provider) =>
      provider.descriptor.categories.includes(category),
    );
  }

  /** Estado de todos los proveedores para el panel de administración. */
  async status(): Promise<ProviderHealth[]> {
    return Promise.all(
      this.list().map(async (provider) => {
        const id = provider.descriptor.id;
        const configured = provider.isConfigured();
        const stored = getHealth(id);

        if (!configured) {
          return {
            providerId: id,
            status: "not_configured" as const,
            configured: false,
            productCount: stored?.productCount ?? 0,
            productsUpdated: 0,
            productsCreated: 0,
            errorCount: 0,
            consecutiveFailures: stored?.consecutiveFailures ?? 0,
            message: `Faltan variables: ${provider.descriptor.requiredEnv.join(", ") || "integración pendiente"}`,
          } satisfies ProviderHealth;
        }

        if (isTemporarilyDisabled(id)) {
          return {
            ...(stored as ProviderHealth),
            status: "disabled" as const,
            message: `Pausado tras fallos consecutivos hasta ${stored?.disabledUntil ?? "—"}`,
          };
        }

        return (
          stored ?? {
            providerId: id,
            status: "connected" as const,
            configured: true,
            productCount: 0,
            productsUpdated: 0,
            productsCreated: 0,
            errorCount: 0,
            consecutiveFailures: 0,
          }
        );
      }),
    );
  }

  /**
   * Sincroniza un proveedor y devuelve el registro de la operación.
   *
   * Ante error NO se borran datos existentes: se marca el log como fallido y se
   * conserva el último catálogo válido (requisito de resiliencia del sistema).
   */
  async sync(
    providerId: string,
    options: { category?: ProductCategory; limit?: number } = {},
  ): Promise<{ log: SyncLogEntry; products: NormalizedProduct[] }> {
    const provider = this.get(providerId);
    if (!provider) throw new ProviderError(`Proveedor desconocido: ${providerId}`, providerId, false);

    const log = startSync(providerId);

    if (!provider.isConfigured()) {
      log.errors.push("Proveedor no configurado");
      recordHealth(providerId, { configured: false, status: "not_configured" });
      return { log: finishSync(log, "FAILED"), products: [] };
    }

    if (isTemporarilyDisabled(providerId)) {
      log.errors.push("Proveedor pausado temporalmente por errores consecutivos");
      return { log: finishSync(log, "FAILED"), products: [] };
    }

    let raw: RawProviderProduct[] = [];
    let status: SyncStatus = "SUCCESS";

    try {
      const page = await provider.getProducts({
        category: options.category,
        limit: options.limit,
      });
      raw = page.items;
    } catch (error) {
      log.errors.push((error as Error).message);
      return { log: finishSync(log, "FAILED"), products: [] };
    }

    const products = normalizeMany(raw, {
      confidence: provider.descriptor.kind === "mock" ? "demo" : "reported",
    });

    const invalid = products.filter((product) => !product.name || !product.externalId);
    if (invalid.length > 0) {
      log.errors.push(`${invalid.length} productos descartados por datos incompletos`);
      status = "PARTIAL";
    }

    log.productsProcessed = products.length;
    log.productsCreated = products.length - invalid.length;
    log.productsUpdated = 0;

    return { log: finishSync(log, status), products };
  }

  /** Sincroniza todos los proveedores activos, uno a uno, respetando sus límites. */
  async syncAll(options: { category?: ProductCategory } = {}): Promise<SyncLogEntry[]> {
    const results: SyncLogEntry[] = [];
    for (const provider of this.active()) {
      const { log } = await this.sync(provider.descriptor.id, options);
      results.push(log);
    }
    return results;
  }

  logs(providerId?: string, limit?: number): SyncLogEntry[] {
    return getLogs(providerId, limit);
  }
}

let manager: ProviderManager | null = null;

export function getProviderManager(): ProviderManager {
  if (!manager) manager = new ProviderManager();
  return manager;
}
