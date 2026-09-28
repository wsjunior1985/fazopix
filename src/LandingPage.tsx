import { useEffect, useState } from 'react';
import { Copy, Printer, QrCode, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

const steps = [
  { number: '01', title: 'Informe os dados' },
  { number: '02', title: 'Confira o QR' },
  { number: '03', title: 'Compartilhe' }
];

function Brand() {
  return (
    <a className="landing-brand" href="/" aria-label="Faz o PIX! início">
      <img src="/icons/fazopix-logo.jpg" alt="" />
      <span>Faz o <strong>PIX!</strong></span>
    </a>
  );
}

function ReceiverPreview() {
  return (
    <div className="landing-preview landing-preview--form" aria-label="Exemplo dos dados solicitados">
      <span className="landing-preview-label">Tipo de chave</span>
      <div className="landing-key-types" aria-hidden="true">
        <span>CPF</span><span>CNPJ</span><span>Celular</span><span>E-mail</span><span>Aleatória</span>
      </div>
      <label>Chave Pix <span>000.000.000-00</span></label>
      <label>Nome do recebedor <span>Ex.: Maria Silva</span></label>
      <label>Cidade <span>Ex.: São Paulo</span></label>
    </div>
  );
}

function QrPreview() {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL('FAZ O PIX - DEMONSTRACAO VISUAL - NAO E UM CODIGO DE PAGAMENTO', {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 720,
      color: { dark: '#0b0b0b', light: '#ffffff' }
    }).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="landing-qr-preview">
      <div className="landing-qr-paper" aria-busy={!qrDataUrl}>
        {qrDataUrl ? <img src={qrDataUrl} alt="QR de demonstração visual, não é um código de pagamento" /> : <QrCode aria-hidden="true" />}
      </div>
      <span>Demonstração visual</span>
    </div>
  );
}

function SharePreview() {
  return (
    <div className="landing-actions-preview" aria-label="Formas de compartilhar o QR gerado">
      <div className="landing-action-example landing-action-example--main"><Copy aria-hidden="true" />Copiar código</div>
      <div className="landing-action-example"><Share2 aria-hidden="true" />Compartilhar</div>
      <div className="landing-action-example"><Printer aria-hidden="true" />Imprimir</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-shell">
        <header className="landing-header">
          <Brand />
          <nav className="landing-nav" aria-label="Navegação principal">
            <a className="landing-privacy-link" href="#privacidade">Privacidade</a>
            <a className="landing-cta landing-cta--header" href="/app">Gerar meu QR Pix</a>
          </nav>
        </header>

        <section className="landing-intro" aria-labelledby="landing-title">
          <h1 id="landing-title">Da chave ao QR, <span>em poucos passos.</span></h1>
          <p>Informe os dados de quem recebe. O app monta o código para copiar, compartilhar ou imprimir.</p>
        </section>

        <ol className="landing-steps" aria-label="Como gerar seu QR Pix">
          {steps.map((step, index) => (
            <li className="landing-step" key={step.number}>
              <div className="landing-step-marker" aria-hidden="true">
                <span>{step.number}</span>
                {index < steps.length - 1 ? <span className="landing-step-connector" /> : null}
              </div>
              <h2>{step.title}</h2>
              {index === 0 ? <ReceiverPreview /> : null}
              {index === 1 ? <QrPreview /> : null}
              {index === 2 ? <SharePreview /> : null}
            </li>
          ))}
        </ol>

        <footer className="landing-bottom" id="privacidade">
          <p>Gerado no seu navegador. Seus dados ficam neste aparelho.</p>
        </footer>
      </div>
    </main>
  );
}
