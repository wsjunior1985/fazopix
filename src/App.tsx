import { lazy, Suspense, useEffect } from 'react';
import LandingPage from './LandingPage';

const PixGenerator = lazy(() => import('./PixGenerator'));

export default function App() {
  const isAppRoute = window.location.pathname === '/app' || window.location.pathname.startsWith('/app/');
  const embeddedDemo = isAppRoute && new URLSearchParams(window.location.search).get('demo') === 'landing';

  useEffect(() => {
    document.title = isAppRoute ? 'Gerador de QR Code Pix | Faz o PIX!' : 'Faz o PIX! — QR Pix em poucos passos';
  }, [isAppRoute]);

  if (!isAppRoute) return <LandingPage />;

  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center p-6 text-center" role="status" aria-live="polite">
          Carregando o gerador Pix…
        </div>
      }
    >
      <PixGenerator embedded={embeddedDemo} />
    </Suspense>
  );
}
