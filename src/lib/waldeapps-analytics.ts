// O painel e os apps usam infraestrutura própria; a coleta de métricas aponta para o endpoint oficial do WaldeApps.
const WALDEAPPS_ENDPOINT = "https://waldeapps.systems/api/public/events";
const WALDEAPPS_FUNNEL_ENDPOINT = "https://waldeapps.systems/api/public/funnel";
const WALDEAPPS_INGEST_KEY = "0fa34561-c43c-4593-9181-2203fbb85e5e";
const VISITOR_STORAGE_KEY = "wa_vid";
const NAVIGATION_EVENT = "waldeapps:navigation";

declare global {
  interface Window {
    __waldeAppsAnalyticsInstalled?: boolean;
    // Exposto para que o admin consiga copiar o fingerprint do console e
    // excluir os próprios dispositivos da contagem no painel.
    __waldeAppsFingerprint?: string;
  }
}

// Identifica o aparelho sem cookie: mesmas propriedades do navegador que o
// painel usa para reconhecer os dispositivos do admin.
async function calculateDeviceFingerprint(): Promise<string> {
  const data = {
    ua: navigator.userAgent,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    tz: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    lang: navigator.language,
    langs: navigator.languages?.join(","),
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
  };

  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(data)),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;

    const created = crypto.randomUUID();
    localStorage.setItem(VISITOR_STORAGE_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function installWaldeAppsAnalytics() {
  if (typeof window === "undefined" || window.__waldeAppsAnalyticsInstalled) return;
  window.__waldeAppsAnalyticsInstalled = true;

  const visitor = getVisitorId();
  let lastPath = "";

  // Calculado uma vez só; o envio espera essa promise para não perder o
  // fingerprint do primeiro pageview.
  const fingerprintReady = calculateDeviceFingerprint()
    .then((value) => {
      window.__waldeAppsFingerprint = value;
      return value;
    })
    .catch(() => undefined);

  const trackPageView = () => {
    const path = window.location.pathname;
    if (path === lastPath) return;
    lastPath = path;

    void fingerprintReady.then((fingerprint) =>
      fetch(WALDEAPPS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ingest-key": WALDEAPPS_INGEST_KEY,
        },
        body: JSON.stringify({ visitor, path, fingerprint }),
        keepalive: true,
      }).catch(() => undefined),
    );
  };

  const notifyNavigation = () => window.dispatchEvent(new Event(NAVIGATION_EVENT));
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    originalPushState(...args);
    notifyNavigation();
  };
  history.replaceState = (...args) => {
    originalReplaceState(...args);
    notifyNavigation();
  };

  window.addEventListener("popstate", trackPageView);
  window.addEventListener(NAVIGATION_EVENT, trackPageView);
  trackPageView();
}

installWaldeAppsAnalytics();

const funnelSentOnce = new Set<string>();

/**
 * Registra uma etapa do funil no painel do WaldeApps. Falha em silêncio: medição
 * nunca pode travar a tela. Com `once`, a etapa vale uma vez por carregamento.
 */
export function trackWaldeAppsFunnel(
  event: string,
  props?: Record<string, string | number | boolean>,
  options?: { once?: boolean },
): void {
  if (typeof window === "undefined") return;
  if (options?.once) {
    if (funnelSentOnce.has(event)) return;
    funnelSentOnce.add(event);
  }

  fetch(WALDEAPPS_FUNNEL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ingest-key": WALDEAPPS_INGEST_KEY,
    },
    body: JSON.stringify({
      visitor: getVisitorId(),
      event,
      path: window.location.pathname,
      props,
      fingerprint: window.__waldeAppsFingerprint,
    }),
    keepalive: true,
  }).catch(() => undefined);
}
