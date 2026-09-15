# TechCompare

Plataforma de comparación de celulares, laptops, procesadores y GPUs orientada a
Bolivia y Latinoamérica. Está pensada para captar tráfico orgánico con contenido
útil y para crecer de cientos a cientos de miles de productos sin reescribir la
aplicación.

No es una landing ni una maqueta: filtra, compara, recomienda, calcula, expone
una API interna y trae la arquitectura de sincronización de catálogos ya montada.

---

## Índice

- [Qué hace](#qué-hace)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Arquitectura de proveedores](#arquitectura-de-proveedores)
- [Sistema de confianza de los datos](#sistema-de-confianza-de-los-datos)
- [SEO](#seo)
- [Rendimiento](#rendimiento)
- [Seguridad](#seguridad)
- [API interna](#api-interna)
- [Panel de administración](#panel-de-administración)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Hoja de ruta](#hoja-de-ruta)

---

## Qué hace

| Función | Ruta | Estado |
| --- | --- | --- |
| Comparador de celulares con filtros y orden | `/celulares` | Completo |
| Comparador de laptops | `/laptops` | Completo |
| Comparador de procesadores | `/procesadores` | Completo |
| Comparador de GPUs | `/gpus` | Completo |
| Ficha técnica por producto | `/celulares/iphone-17` | Completo |
| Comparación lado a lado con veredicto | `/comparar/celulares/iphone-17-vs-galaxy-s26` | Completo |
| Recomendador "¿qué teléfono me conviene?" | `/que-telefono-me-conviene` | Completo |
| Calculadora de almacenamiento | `/calculadora-almacenamiento` | Completo |
| Rankings y guías de compra | `/mejores/...`, `/guias/...` | Completo |
| Buscador con sugerencias | `/buscar` | Completo |
| Panel de administración | `/admin` | Lectura; escritura requiere base de datos |

**Detalles que conviene conocer:**

- Se pueden comparar **2 o 3 productos**. La selección viaja en la URL, así que
  la vista con filtros y productos elegidos se puede compartir tal cual.
- El veredicto de "¿Cuál es mejor?" **se genera a partir de las
  especificaciones**, no es una plantilla fija: cambia según las diferencias
  reales entre los equipos comparados.
- El resultado del recomendador y el de la calculadora son **enlaces
  compartibles**: todas las respuestas se codifican en la query string.
- Cada fila de la tabla comparativa resalta el mejor valor, y las filas donde
  todos empatan no declaran ganador.

---

## Tecnologías

| Área | Elección | Por qué |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Server Components, ISR y generación estática por ruta |
| Lenguaje | TypeScript en modo estricto | Cero `any` en el dominio |
| Estilos | Tailwind CSS 4 | Tokens en CSS, sin archivo de configuración JS |
| Iconos | lucide-react | Importación por icono, sin sprite global |
| Base de datos | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) | Esquema tipado y migraciones |
| Validación | Zod 4 | Entorno, cuerpos de API y entrada de usuario |
| Pruebas | Runner nativo de Node + tsx | Sin dependencias de test adicionales |

Dependencias de ejecución: siete en total (`next`, `react`, `react-dom`,
`@prisma/client`, `@prisma/adapter-pg`, `zod`, `lucide-react`, más `clsx` y
`tailwind-merge` para componer clases). **No se usa ninguna librería de
gráficas**: el gráfico de evolución de precio es SVG generado en el servidor.

---

## Estructura del proyecto

```
techcompare/
├── prisma/
│   ├── schema.prisma          # Modelo completo: producto maestro, ofertas, precios, sync
│   └── seed.ts                # Carga inicial idempotente
├── prisma.config.ts           # Configuración del CLI (Prisma 7)
├── docs/
│   └── proveedores.md         # Investigación de APIs y estado de cada fuente
├── src/
│   ├── app/                   # Rutas (App Router)
│   │   ├── celulares|laptops|procesadores|gpus/   # Listado + ficha
│   │   ├── comparar/[categoria]/[slug]/           # Comparación a-vs-b
│   │   ├── mejores/[slug]/                        # SEO programático
│   │   ├── guias/[slug]/                          # Guías de compra
│   │   ├── que-telefono-me-conviene/              # Recomendador
│   │   ├── calculadora-almacenamiento/
│   │   ├── admin/                                 # Panel protegido
│   │   ├── api/                                   # API interna y cron jobs
│   │   ├── sitemap.ts, robots.ts, icon.svg
│   │   └── not-found.tsx, error.tsx, global-error.tsx
│   ├── components/
│   │   ├── ui/                # Primitivas: botón, tarjeta, insignia, estados, esqueletos
│   │   ├── layout/            # Cabecera, pie, buscador, tema, migas
│   │   ├── product/           # Ficha, tarjeta, ofertas, precio, procedencia
│   │   ├── catalog/           # Filtros, orden, paginación, bandeja de comparación
│   │   ├── compare/           # Tabla comparativa y veredicto
│   │   ├── quiz/, calculator/ # Herramientas interactivas
│   │   ├── home/, admin/, ads/, seo/, analytics/
│   ├── data/                  # Catálogo inicial y contenido editorial
│   ├── lib/
│   │   ├── providers/         # Contrato, gestor y fuentes de datos
│   │   │   ├── phones/        # 10 marcas de smartphone
│   │   │   ├── computing/     # 12 marcas de computación
│   │   │   ├── retailers/     # Mercado Libre, Amazon, tiendas locales
│   │   │   └── feeds/         # Importador CSV / XML / JSON
│   │   ├── normalization/     # Sinónimos, unidades, duplicados
│   │   ├── repositories/      # Consultas de catálogo y colecciones
│   │   ├── compare/           # Tablas y motor de veredicto
│   │   ├── recommend/         # Motor del recomendador
│   │   ├── calculator/        # Motor de la calculadora
│   │   ├── scoring/           # Derivación de índices
│   │   ├── currency/          # Tipos de cambio y formato
│   │   ├── seo/               # Metadata, schema.org, rutas
│   │   ├── security/          # Autenticación, límites, saneamiento
│   │   ├── analytics/, api/, catalog/
│   │   ├── config.ts, env.ts, db.ts, utils.ts
│   ├── hooks/                 # Hooks de cliente
│   ├── types/                 # Tipos del dominio
│   └── proxy.ts               # Protección de /admin
└── tests/                     # 61 pruebas del dominio
```

La separación es estricta: los componentes no contienen especificaciones, los
datos no contienen lógica y la lógica no conoce el framework.

---

## Instalación y desarrollo local

Requisitos: Node.js 20 o superior y npm. PostgreSQL es **opcional**.

```bash
git clone <url-del-repositorio>
cd techcompare
npm install
cp .env.example .env.local
npm run dev
```

Abre <http://localhost:3000>. **Funciona sin base de datos**: si `DATABASE_URL`
no está definida, el catálogo se sirve desde los datos iniciales del
repositorio. Es intencional, para que arrancar el proyecto no dependa de montar
infraestructura.

### Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Servir la compilación |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Pruebas del dominio |
| `npm run db:generate` | Generar el cliente de Prisma |
| `npm run db:migrate` | Crear y aplicar migración en desarrollo |
| `npm run db:deploy` | Aplicar migraciones en producción |
| `npm run db:seed` | Cargar el catálogo inicial |
| `npm run db:studio` | Explorador de base de datos |

---

## Variables de entorno

Todas son opcionales salvo que quieras activar la función correspondiente. La
plantilla completa y comentada está en `.env.example`.

| Variable | Para qué | Si falta |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical, Open Graph, sitemap | Se usa `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL | Se usa el catálogo inicial del repositorio |
| `ADMIN_TOKEN` | Acceso a `/admin` (mínimo 16 caracteres) | **El panel queda inaccesible** |
| `CRON_SECRET` | Autorización de los cron jobs | Los endpoints de cron responden 401 |
| `EXCHANGE_RATE_USD_BOB` | Conversión mostrada | Se usa 6,96 |
| `EXCHANGE_RATE_API_URL` | Tipos de cambio dinámicos | Se usan las tasas fijas |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | No se carga ningún script |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense | No se carga ningún script |
| `NEXT_PUBLIC_ADS_ENABLED` | Interruptor de publicidad | `false` |
| Claves de proveedor | Ver `.env.example` | El proveedor queda inactivo |

`.env.local` está en `.gitignore`. **No hay ninguna credencial en el código.**

---

## Base de datos

El esquema (`prisma/schema.prisma`) está construido para escalar:

- **`Product`** es el producto maestro, con especificaciones tipadas en tablas
  satélite (`Phone`, `Laptop`, `Cpu`, `Gpu`) y `Specification` para campos
  libres con su propia trazabilidad.
- **`ProductOffer`** permite N ofertas del mismo producto en distintas tiendas.
  De ahí sale el "mejor precio encontrado".
- **`PriceHistory`** es una serie temporal separada de la oferta vigente, lo que
  permite mostrar mínimo histórico y variación porcentual.
- **`CountryAvailability`** distingue existir globalmente de estar disponible en
  Bolivia.
- **`ExternalProductRef`** guarda el identificador en cada fuente y la huella
  normalizada del nombre, que es lo que usa la detección de duplicados.
- **`PriceAlert`** soporta correo, notificación push y Telegram.
- **`ProviderState`** y **`SyncLog`** registran salud y sincronizaciones.

```bash
# Con DATABASE_URL configurada
npm run db:migrate    # crea la migración inicial
npm run db:seed       # carga el mismo catálogo que usa la web sin base de datos
```

La siembra es idempotente: se puede repetir sin duplicar filas.

---

## Arquitectura de proveedores

La aplicación **nunca habla con una API externa directamente**. Habla con un
`ProductProvider`:

```
API de fabricante ─┐
API de tienda ─────┤
Feed CSV/XML/JSON ─┼──▶ PROVIDER MANAGER ──▶ NORMALIZACIÓN ──▶ BASE DE DATOS
Importación manual ┘                                              │
                                                                  ▼
                                            HISTORIAL DE PRECIOS ─▶ CACHÉ ─▶ WEB
```

Todos los proveedores implementan el mismo contrato: `getProducts`,
`getProductById`, `searchProducts`, `getCategories`, `getBrands`, `getPrices`,
`getAvailability`, `getProductImages`.

Hay **26 proveedores registrados**: 10 marcas de smartphone, 12 de computación,
Mercado Libre, Amazon, tres feeds de tienda y el catálogo inicial.

**Lo que este proyecto no hace:** no inventa APIs, no hace scraping de sitios que
lo prohíben y no elude CAPTCHAs, autenticación ni límites. Una marca sin API
pública verificable se registra como proveedor inactivo, listo para conectar el
día que exista un acuerdo o un feed autorizado. El detalle de qué se comprobó
para cada fuente está en [`docs/proveedores.md`](docs/proveedores.md).

**Normalización.** Cada API llama a las cosas de forma distinta. `RAM`,
`memory`, `ram_size` y `Memoria RAM` acaban todas en `ram`, y `8GB`,
`8192 MB` y `8` acaban todos en el número `8`. Lo mismo con almacenamiento,
pantalla, batería, cámara, procesador, GPU, peso y precio.

**Duplicados.** La misma laptop aparece en tres tiendas con tres títulos
distintos. Se reduce el nombre a su huella significativa (descartando palabras
de relleno como "notebook", "sellado" o "envío gratis") y se agrupan por
similitud de Jaccard.

**Sincronización.** Los cron jobs viven en `/api/cron/sync-catalog` (diario) y
`/api/cron/sync-prices` (cada tres horas), protegidos con `CRON_SECRET`. El
catálogo se procesa **por lotes con cursor**, de modo que ninguna ejecución se
acerca al límite de duración de una función serverless.

**Resiliencia.** Si una fuente falla no se borra nada: se registra el error y se
conservan los últimos datos válidos. Tras tres fallos consecutivos el proveedor
se pausa una hora y aparece marcado en el panel. Las peticiones usan backoff
exponencial y respetan la cabecera `Retry-After`.

---

## Sistema de confianza de los datos

Cada dato lleva `source`, `sourceUrl`, `lastUpdated` y `confidence`
(`verified`, `reported`, `estimated`, `demo`).

El catálogo incluido en el repositorio está marcado **`demo`** y se muestra como
tal en cada ficha, con el aviso correspondiente. Son datos iniciales para que la
plataforma sea verificable de extremo a extremo, **no especificaciones
confirmadas**, y se reemplazan producto a producto conforme entran fuentes
reales.

Esto tiene una consecuencia concreta en el SEO: **no se emite `Offer` con precio
en schema.org para datos `demo`**. Publicar precios sin verificar como si fueran
reales es exactamente lo que penaliza Google.

---

## SEO

- Metadata dinámica por página con `title`, `description`, canonical, Open Graph
  y Twitter Cards. Imagen social generada al vuelo en `/api/og`.
- Datos estructurados: `Organization`, `WebSite` con `SearchAction`, `Product`,
  `BreadcrumbList`, `FAQPage`, `ItemList` y `Article`.
- `sitemap.xml` generado desde el catálogo real y `robots.txt` que excluye
  `/admin`, `/api` y las páginas de resultados de búsqueda.
- URLs limpias en español: `/celulares/iphone-17`,
  `/comparar/celulares/iphone-17-vs-galaxy-s26`, `/mejores/mejor-celular-para-gaming`.
- **153 páginas se generan estáticamente** en la compilación.
- Un producto inexistente devuelve **404 de verdad**, no un 200 con aspecto de
  error. Las páginas que llaman a `notFound()` no se envían por streaming
  precisamente para que el código de estado sea correcto.

**SEO programático con freno.** Las colecciones de `/mejores/...` solo se
publican si producen **al menos tres resultados reales**, y cada una declara su
criterio de ordenación, una introducción propia y sus preguntas frecuentes. La
regla está en `publishableCollections()` y hay una prueba que la verifica. El
objetivo es no generar cientos de páginas vacías.

---

## Rendimiento

- Server Components por defecto. Solo son de cliente los filtros, el buscador,
  el selector de tema, el cuestionario, la calculadora y la bandeja de
  comparación.
- Los filtros viven en la URL y se resuelven en el servidor: el navegador no
  descarga el catálogo para filtrar.
- El gráfico de precios es SVG renderizado en servidor, sin librería de gráficas.
- Las imágenes de producto ausentes se resuelven con un marcador SVG inline
  determinista: cero peticiones de red y cero desplazamiento de maquetación.
  Cuando haya imágenes oficiales, `next/image` sirve AVIF y WebP.
- Revalidación incremental: una hora para catálogo, quince minutos para páginas
  con precio.
- Esqueletos de carga, estados vacíos y estados de error en todas las vistas.
- Animaciones discretas, desactivadas si el sistema pide movimiento reducido.

---

## Seguridad

- Entorno validado con Zod al arrancar; los errores nombran la clave, nunca el
  valor.
- Toda entrada de usuario pasa por saneamiento (`sanitizeText`, `sanitizeSlug`,
  `sanitizeInteger`) antes de usarse.
- Límite de peticiones por IP en todos los endpoints públicos, con cabeceras
  `X-RateLimit-*`. El endpoint de acceso al panel tiene un límite mucho más
  estricto.
- `/admin` protegido por `proxy.ts` con cookie `HttpOnly`, `SameSite=Strict` y
  `Secure` en producción. **Sin `ADMIN_TOKEN` el panel no es accesible.**
- Comparación de tokens en tiempo constante.
- Cron jobs autorizados por `Bearer`.
- Prisma parametriza todas las consultas: no hay SQL construido por
  concatenación.
- React escapa por defecto; el único `dangerouslySetInnerHTML` es el JSON-LD que
  generamos nosotros, con `<` escapado.
- Cabeceras de seguridad en `next.config.ts`: `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS.

---

## API interna

El frontend consume nuestra propia capa de datos, nunca APIs de terceros
directamente.

| Endpoint | Descripción |
| --- | --- |
| `GET /api/products` | Catálogo con los mismos filtros que la web |
| `GET /api/products/:id` | Producto individual |
| `GET /api/products/search` | Búsqueda con sugerencias |
| `GET /api/products/:id/offers` | Ofertas por tienda y resumen de precio |
| `GET /api/compare` | Tabla comparativa y veredicto |
| `GET /api/providers/status` | Estado de cada fuente de datos |
| `POST /api/price-alerts` | Alta de aviso de bajada de precio |
| `GET /api/cron/sync-catalog` | Sincronización por lotes (requiere `CRON_SECRET`) |
| `GET /api/cron/sync-prices` | Actualización de precios (requiere `CRON_SECRET`) |
| `GET /api/og` | Imagen social generada |

---

## Panel de administración

`/admin` requiere `ADMIN_TOKEN`. Incluye:

- **Resumen**: tamaño del catálogo, proveedores conectados, estado de la base de
  datos.
- **Proveedores**: estado, última sincronización, productos actualizados, nuevos,
  errores, duración y la nota de cumplimiento de cada fuente.
- **Productos**: listado con nivel de confianza y antigüedad del dato. La edición
  requiere base de datos; sin ella el panel lo indica explícitamente en lugar de
  ofrecer botones que no harían nada.

---

## Pruebas y calidad

```bash
npm run lint       # sin errores ni avisos
npm run typecheck  # sin errores
npm test           # 61 pruebas
npm run build      # 153 páginas estáticas
```

Las pruebas cubren lo que de verdad puede romperse en silencio: el diccionario
de sinónimos y la conversión de unidades, los parsers de CSV y XML, la detección
de duplicados, los filtros de catálogo, el motor de comparación, el recomendador,
la calculadora, la conversión de moneda, el saneamiento de entrada y el limitador
de peticiones. También verifican invariantes del catálogo: slugs únicos,
puntuaciones dentro de rango y que ninguna colección se publique vacía.

---

## Despliegue en Vercel

1. Importa el repositorio en Vercel. El *framework preset* se detecta solo.
2. Define las variables de entorno del proyecto. Como mínimo
   `NEXT_PUBLIC_SITE_URL`. Para el panel y los cron jobs, `ADMIN_TOKEN` y
   `CRON_SECRET`.
3. Si usas base de datos, añade `DATABASE_URL` y ejecuta `npm run db:deploy`
   seguido de `npm run db:seed`.
4. `vercel.json` ya declara los cron jobs: catálogo a diario a las 05:00 UTC y
   precios cada tres horas. Vercel envía `CRON_SECRET` como cabecera
   `Authorization`.
5. La región configurada es `gru1` (São Paulo), la más cercana a Bolivia.

**No hay secretos en el código.** Todo lo sensible se resuelve por variables de
entorno del proyecto.

---

## Hoja de ruta

**Corto plazo**

- Conectar Intel vía OData y Mercado Libre con token propio: son las dos
  integraciones verificadas más inmediatas.
- Primera tienda boliviana con feed autorizado.
- Sustituir productos `demo` por datos verificados conforme entren las fuentes.

**Medio plazo**

- Persistir sincronizaciones y salud de proveedores en base de datos en lugar de
  en memoria del proceso.
- Entrega real de alertas de precio por correo y Telegram.
- Índice de búsqueda dedicado cuando el catálogo supere unos pocos miles de
  productos.
- Imágenes oficiales de producto con acuerdo de uso.

**Largo plazo**

- Sección editorial con reseñas propias.
- Comparativas guardadas por usuario y cuentas.
- Ampliar cobertura a más países de la región con disponibilidad real por país.
- Activar publicidad una vez haya tráfico consolidado, sin degradar los Core Web
  Vitals.
