import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource-variable/figtree';
import './styles.css';
import { registerSW } from 'virtual:pwa-register';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

if (location.protocol !== 'file:') {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => void registration.update(), 60 * 60 * 1000);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
