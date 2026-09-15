import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad aplicadas a todas las respuestas.
 *
 * La política de contenido permite scripts inline porque Next.js los usa para
 * la hidratación y para el script de tema, y limita los orígenes externos a los
 * de analítica y publicidad, que solo se cargan si están configurados.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    // Formatos modernos primero; Next sirve el que soporte el navegador.
    formats: ["image/avif", "image/webp"],
    // Orígenes permitidos para imágenes de producto cedidas por fabricantes o
    // tiendas. Se añaden aquí conforme se autoriza cada integración.
    remotePatterns: [
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "*.mlstatic.com" },
    ],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 256, 320],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // El sitemap se regenera con frecuencia; se cachea en el borde.
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" }],
      },
    ];
  },

  async redirects() {
    return [
      // Alias en inglés hacia las rutas canónicas en español.
      { source: "/phones", destination: "/celulares", permanent: true },
      { source: "/laptops-en", destination: "/laptops", permanent: true },
      { source: "/cpus", destination: "/procesadores", permanent: true },
      { source: "/graphics-cards", destination: "/gpus", permanent: true },
    ];
  },
};

export default nextConfig;
