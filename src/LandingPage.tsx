function Brand() {
  return (
    <a className="landing-brand" href="/" aria-label="Faz o PIX! início">
      <img src="/icons/fazopix-logo.webp" alt="" />
      <span>Faz o <strong>PIX!</strong></span>
    </a>
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
          <h1 id="landing-title">Crie seu QR Pix <span>no próprio navegador.</span></h1>
          <p>Informe uma chave válida, confira o código e copie, compartilhe ou imprima.</p>
        </section>

        <section className="landing-product" aria-label="Gerador real de QR Pix">
          <iframe
            src="/app?demo=landing"
            title="Gerador de QR Pix Faz o PIX!"
            loading="lazy"
            allow="clipboard-write"
          />
        </section>

        <footer className="landing-bottom" id="privacidade">
          <p>Os dados preenchidos nesta demonstração ficam apenas na sessão e não são salvos.</p>
        </footer>
      </div>
    </main>
  );
}
