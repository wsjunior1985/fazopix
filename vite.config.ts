import { createServer, defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = 'https://fazopix.waldeapps.systems';

// A landing é estática: renderiza no build dentro do index.html para o buscador
// receber h1 e texto sem depender de JS. O /app continua com o shell vazio em
// app.html, servido pelo nginx e pelo service worker. Roda no generateBundle,
// antes de o VitePWA gerar o sw.js, para o precache levar a revisão certa.
function prerenderLanding(): Plugin {
  return {
    name: 'fazopix:prerender-landing',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_options, bundle) {
      const asset = bundle['index.html'];
      if (!asset || asset.type !== 'asset') return;
      const shell = String(asset.source);

      const server = await createServer({
        configFile: false,
        logLevel: 'error',
        plugins: [react()],
        server: { middlewareMode: true, hmr: false, ws: false },
        optimizeDeps: { noDiscovery: true, entries: [] },
        appType: 'custom'
      });
      try {
        const { renderToString } = await import('react-dom/server');
        const { createElement } = await import('react');
        const { default: LandingPage } = await server.ssrLoadModule('/src/LandingPage.tsx');
        const markup: string = renderToString(createElement(LandingPage));
        if (!markup.includes('<h1')) throw new Error('prerender da landing saiu sem h1');
        if (!shell.includes('<div id="root"></div>')) throw new Error('index.html sem #root vazio');
        asset.source = shell.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
      } finally {
        await server.close();
      }

      this.emitFile({
        type: 'asset',
        fileName: 'app.html',
        source: shell
          .replace(/<title>[^<]*<\/title>/, '<title>Gerador de QR Code Pix | Faz o PIX!</title>')
          .replaceAll('content="Faz o PIX! — QR Pix em poucos passos"', 'content="Gerador de QR Code Pix | Faz o PIX!"')
          .replaceAll(`${SITE_URL}/"`, `${SITE_URL}/app"`)
      });
    }
  };
}

function pwaAssets(): Plugin {
  return {
    name: 'fazopix:pwa-assets',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const manifest = {
        id: '/app',
        lang: 'pt-BR',
        name: 'Faz o PIX!',
        short_name: 'Faz o PIX!',
        description: 'Gerador de QR Code Pix estático offline-first.',
        theme_color: '#f4f5f6',
        background_color: '#f4f5f6',
        display: 'standalone',
        scope: '/',
        start_url: '/app',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      };
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify(manifest, null, 2)
      });

      const publicAssets = [
        '/',
        '/app.html',
        '/manifest.webmanifest',
        '/favicon.png',
        '/icons/apple-touch-icon.png',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/icons/icon-512-maskable.png',
        '/icons/fazopix-logo.webp'
      ];
      const bundleAssets = Object.keys(bundle)
        .filter((fileName) => fileName !== 'sw.js' && /\.(?:html|js|css|png|svg|webp|woff2?)$/.test(fileName))
        .map((fileName) => `/${fileName}`);
      const precacheUrls = [...new Set([...publicAssets, ...bundleAssets])];
      const versionHash = createHash('sha256')
        .update(JSON.stringify(manifest))
        .update(JSON.stringify(precacheUrls));
      for (const assetUrl of publicAssets.filter((url) => !['/', '/app.html', '/manifest.webmanifest'].includes(url))) {
        versionHash.update(readFileSync(resolve('public', assetUrl.slice(1))));
      }
      const appShell = bundle['app.html'];
      if (!appShell || appShell.type !== 'asset') throw new Error('shell do app.html ausente no bundle PWA');
      versionHash.update(String(appShell.source));
      versionHash.update(Object.entries(bundle)
        .map(([name, asset]) => `${name}:${asset.type === 'asset' ? String(asset.source) : asset.code}`)
        .join('|'));
      const version = versionHash
        .digest('hex')
        .slice(0, 12);
      const worker = `const CACHE_NAME = 'fazopix-shell-${version}';
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};
const TRACKING_PARAM = /^(?:v|fbclid|utm_.*)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then((keys) => Promise.all(keys.filter((key) =>
      (key.startsWith('fazopix-shell-') && key !== CACHE_NAME) || key.startsWith('workbox-precache-v2-' + self.location.origin + '/')
    ).map((key) => caches.delete(key))))
  ]));
});

function cacheLookupUrl(request) {
  const url = new URL(request.url);
  for (const key of [...url.searchParams.keys()]) if (TRACKING_PARAM.test(key)) url.searchParams.delete(key);
  return url.href;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cachedPage = await caches.match(cacheLookupUrl(request));
      return cachedPage || caches.match('/app.html');
    }));
    return;
  }

  if (PRECACHE_URLS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(caches.match(cacheLookupUrl(request)).then((cached) => cached || fetch(request)));
  }
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: worker });
    }
  };
}

export default defineConfig({
  base: '/',
  // Porta fixa e exclusiva deste projeto: é a liberada no redirect do login Google em dev.
  server: { port: 8110, strictPort: true },
  plugins: [
    react(),
    prerenderLanding(),
    pwaAssets()
  ]
});
