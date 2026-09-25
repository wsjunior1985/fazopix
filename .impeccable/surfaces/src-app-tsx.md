---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface Brief: Faz o PIX! (Main App)

## Overview
- **Scope**: Gerador de QR Pix de tela única
- **Visitor Mode**: Operate
- **Audience**: Pessoas físicas e autônomos que precisam cobrar via Pix na hora, sem cadastro.
- **Job to be Done**: Chave, nome e cidade (valor opcional) e sair com QR pronto para copiar, compartilhar, baixar ou imprimir.
- **Constraints**: 100% client-side, PWA/offline, acessível, responsivo, claro e escuro.
- **User answers (2026-09-25)**: rejeitou story violeta, placa de rodovia, plaquinha de balcão (genérica, cena atrapalha, pouco profissional, fluxo lento), maquininha e passe de carteira. Pediu algo mais profissional e escolheu o padrão da categoria na rodada segura. Preservar o nome "Faz o PIX!" e o tom coloquial.

## Direction contract

THESIS: O padrão da categoria executado com acabamento de primeira: a cobrança Pix como Mercado Pago, Nubank e PicPay a fazem, sem conceito decorativo. Recusa cenas, metáforas e cor barulhenta.

OWN-WORLD: Fundo neutro #f4f5f6, cartões brancos com canto 20–24px e sombra leve, um verde de marca (#00806b; #19c2a6 no escuro) só na ação principal, foco e seleção; botões em pílula; Figtree. QR em moldura branca com borda fina.

STORY: A pessoa digita o valor (primeiro campo), confere o recebedor (resumo de uma linha quando salvo, com Editar) e copia o código ou compartilha; o QR fica sempre à vista.

FIRST VIEWPORT: Celular: marca e tema; cartão "Cobrar com Pix" com QR central, valor grande, recebedor, "Copiar código Pix" em pílula verde, "Compartilhar" em pílula suave e PNG/SVG/Imprimir como links. Desktop: dados à esquerda, cartão da cobrança fixo à direita.

SIGNATURE INTERACTION: Recebedor recolhe para um resumo com avatar e "Editar" quando válido e salvo; o valor troca com deslize vertical e o QR entra com leve escala.

FORM: Padrão da categoria (canon), chave de seed 3c841b63, reroll 1 no registro safer, --kind canon registrado; pares de acabamento: Mercado Pago, Nubank, PicPay.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
