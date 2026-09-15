/**
 * Eventos de analítica.
 *
 * Los nombres están centralizados para que el mismo evento se llame igual en
 * toda la aplicación y para poder configurarlos en Google Analytics sin
 * perseguir strings por el código. Sin `NEXT_PUBLIC_GA_MEASUREMENT_ID` las
 * llamadas no hacen nada: no se envía nada a ningún servicio externo.
 */
export const ANALYTICS_EVENTS = {
  search: "search",
  productView: "product_view",
  comparisonCreated: "comparison_created",
  recommendationCompleted: "recommendation_completed",
  calculatorUsed: "calculator_used",
  filterApplied: "filter_applied",
  offerClicked: "offer_clicked",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type GtagWindow = Window & {
  gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  dataLayer?: unknown[];
};

export function trackEvent(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as GtagWindow).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", event, params);
}

export function trackSearch(query: string, resultCount: number): void {
  trackEvent(ANALYTICS_EVENTS.search, { search_term: query, result_count: resultCount });
}

export function trackProductView(category: string, slug: string): void {
  trackEvent(ANALYTICS_EVENTS.productView, { item_category: category, item_id: slug });
}

export function trackComparison(category: string, slugs: string[]): void {
  trackEvent(ANALYTICS_EVENTS.comparisonCreated, {
    item_category: category,
    items: slugs.join(","),
    item_count: slugs.length,
  });
}

export function trackRecommendation(budget: string, os: string): void {
  trackEvent(ANALYTICS_EVENTS.recommendationCompleted, { budget, os });
}

export function trackCalculator(recommended: number, totalGb: number): void {
  trackEvent(ANALYTICS_EVENTS.calculatorUsed, { recommended_gb: recommended, needed_gb: totalGb });
}
