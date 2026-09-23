import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/chivo/400.css';
import '@fontsource/chivo/600.css';
import '@fontsource/chivo/700.css';
import '@fontsource/chivo/800.css';
import '@fontsource/chivo-mono/400.css';
import '@fontsource/chivo-mono/600.css';
import '@fontsource/chivo-mono/700.css';
import '@fontsource/chivo-mono/800.css';
import './styles.css';

if (location.protocol !== 'file:' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
