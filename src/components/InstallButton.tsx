import { useState } from 'react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { useInstall } from '../lib/pwa/install';

export default function InstallButton() {
  const { mode, install } = useInstall();
  const [hintOpen, setHintOpen] = useState(false);

  if (mode === 'none') return null;

  return (
    <>
      <button
        type="button"
        className="install-button"
        onClick={() => (mode === 'native' ? void install() : setHintOpen((open) => !open))}
        aria-expanded={mode === 'ios' ? hintOpen : undefined}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Instalar
      </button>
      {mode === 'ios' && hintOpen ? (
        <div className="install-hint" role="region" aria-label="Como instalar no iPhone e no iPad">
          <button type="button" className="install-hint-close" onClick={() => setHintOpen(false)} aria-label="Fechar">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="install-hint-title">Instale o Faz o PIX! no iPhone ou iPad</p>
          <ol>
            <li>
              Toque em <Share className="inline h-4 w-4 align-[-2px]" aria-hidden="true" /> <strong>Compartilhar</strong> na barra do Safari.
            </li>
            <li>
              Escolha <SquarePlus className="inline h-4 w-4 align-[-2px]" aria-hidden="true" /> <strong>Adicionar à Tela de Início</strong>.
            </li>
          </ol>
        </div>
      ) : null}
    </>
  );
}
