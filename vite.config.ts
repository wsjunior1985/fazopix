import { createServer, defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

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

export default defineConfig({
  base: '/',
  // Porta fixa e exclusiva deste projeto: é a liberada no redirect do login Google em dev.
  server: { port: 8110, strictPort: true },
  plugins: [
    react(),
    prerenderLanding(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      workbox: {
        // Navegação offline cai no shell vazio: a landing pré-renderizada no
        // index.html piscaria antes do gerador em /app.
        navigateFallback: '/app.html',
        ignoreURLParametersMatching: [/^v$/, /^utm_/, /^fbclid$/]
      },
      manifest: {
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
      }
    })
  ]
});
