import Script from "next/script";
import { features } from "@/lib/config";
import { publicEnv } from "@/lib/env";

/**
 * Carga de Google Analytics.
 *
 * Solo se inyecta si hay identificador configurado por variable de entorno.
 * Sin él no se carga ningún script externo ni se envía nada a terceros.
 */
export function Analytics() {
  const measurementId = publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!features.analyticsEnabled || !measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

/** Script de AdSense; igual que arriba, solo se carga si está habilitado. */
export function AdsScript() {
  const clientId = publicEnv.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!features.adsEnabled || !clientId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
