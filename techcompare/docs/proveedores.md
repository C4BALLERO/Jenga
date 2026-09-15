# Proveedores de datos: investigación y estado

Este documento registra qué se comprobó antes de implementar cada integración.
Es deliberadamente conservador: **si no se pudo verificar que existe una API o
un feed autorizado, no se implementa nada** y el proveedor queda registrado a la
espera de credenciales.

Fecha de la revisión: **septiembre de 2026**.

## Reglas que sigue el proyecto

1. Solo APIs oficiales, feeds cedidos por el comercio o importación manual.
2. Nunca se elude autenticación, CAPTCHA, Cloudflare, límites ni cuotas.
3. No se hace scraping de sitios que lo prohíben en sus términos de uso.
4. Si una marca no publica API, se crea un proveedor inactivo listo para
   conectar, no una API inventada.
5. Todo dato entra por `normalizeProduct()` y conserva `source`, `sourceUrl`,
   `lastUpdated` y `confidence`.

## Resultado por fuente

### Con vía programática confirmada

| Fuente | Vía | Estado | Qué falta |
| --- | --- | --- | --- |
| **Intel** | Servicio OData de ARK (`odata.intel.com`) y portal de API de producto (`api-portal.intel.com`, requiere registro) | Proveedor registrado, inactivo | Credenciales (`INTEL_API_KEY`) y validación del contrato de datos |
| **Mercado Libre** | API oficial documentada en `developers.mercadolibre.com`. Búsqueda por sitio (`/sites/{site}/search`) y detalle de ítem (`/items/{id}`) | **Cliente implementado**, inactivo sin token | Aplicación registrada y `MERCADOLIBRE_ACCESS_TOKEN` (los tokens caducan a las 6 horas) |
| **Amazon** | Product Advertising API 5.0 | Proveedor registrado, inactivo | Cuenta de Amazon Associates aprobada con ventas cualificadas y firma AWS SigV4 |
| **Tiendas locales** | Feed CSV / XML / JSON cedido por el comercio | **Parser implementado y probado** | URL del feed y autorización escrita de cada tienda |

> **Aviso importante sobre Mercado Libre y Bolivia:** Mercado Libre no tiene
> sitio en Bolivia. Sus identificadores cubren Argentina (MLA), Brasil (MLB),
> Chile (MLC), Colombia (MCO), México (MLM), Perú (MPE) y Uruguay (MLU). Sus
> precios sirven como **referencia regional**, nunca como oferta disponible
> localmente. Por eso existe `CountryAvailability`: un producto puede existir en
> la región y no estar disponible en Bolivia.

### Sin API pública de catálogo verificable

Ninguna de estas marcas publica, de forma verificable, una API abierta con el
catálogo comercial y sus especificaciones técnicas. Sus portales de
desarrollador cubren otra cosa (SDK de dispositivo, servicios de aplicación,
soporte y garantía), no la ficha de producto.

**Smartphones:** Apple, Samsung, Xiaomi, Motorola, Google, OnePlus, HONOR, OPPO,
vivo, Huawei.

**Computación:** NVIDIA, AMD, Apple Silicon, Lenovo, ASUS, Acer, HP, Dell, MSI,
GIGABYTE, Microsoft.

Notas concretas de la revisión:

- **NVIDIA**: `developer.nvidia.com` y `build.nvidia.com` ofrecen SDK y modelos
  de IA. NVAPI es un SDK local de driver para Windows, no un catálogo de
  producto. No hay API de especificaciones de GPU.
- **Samsung / HONOR / OPPO / vivo / Huawei**: sus portales son plataformas para
  desarrolladores de aplicaciones, no catálogos comerciales.
- **Google**: no expone API de Google Store. La vía autorizada realista es el
  feed de Google Merchant Center que comparte el propio comercio.
- **Dell / HP**: exponen API de soporte y garantía previa autorización, no
  especificaciones de catálogo abierto.

Para todas ellas, la vía prevista es un acuerdo de partner, un programa de
afiliados con feed de producto, o una importación manual verificada. La clase
`ManualImportProvider` existe exactamente para eso: mismo contrato, cero
peticiones mientras no haya credenciales.

## Cómo añadir una fuente nueva

1. Crear la clase en `src/lib/providers/` implementando `ProductProvider`
   (o extendiendo `BaseProvider` / `FeedProvider`).
2. Declarar su `descriptor`: capacidades, `rateLimit`, `schedule`,
   `requiredEnv` y `complianceNote`.
3. Registrarla en la lista `PROVIDERS` de `provider-manager.ts`.
4. Añadir las variables al `.env.example`.
5. Usar siempre `providerFetch()`, que aplica límite de peticiones, timeout,
   backoff exponencial y respeta la cabecera `Retry-After`.

No hay que tocar repositorios, páginas ni componentes: el resto del sistema
solo conoce la interfaz.

## Qué pasa cuando una fuente falla

- El log de sincronización se marca `FAILED` y **se conservan los últimos datos
  válidos**. Nunca se borran productos por un fallo de API.
- Tras tres fallos consecutivos el proveedor se pausa automáticamente durante
  una hora y aparece marcado en `/admin/providers`.
- La interfaz sigue mostrando "Actualizado hace X" con la marca real del último
  dato bueno, para que el lector sepa qué antigüedad tiene lo que ve.
