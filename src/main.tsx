import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource-variable/figtree';
import './styles.css';
import './lib/waldeapps-analytics';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol !== 'file:') {
  void navigator.serviceWorker.register('/sw.js').then((registration) => {
    setInterval(() => void registration.update().catch(() => {}), 60 * 60 * 1000);
  }).catch((error: unknown) => {
    console.warn('Não foi possível registrar o app para uso offline.', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
