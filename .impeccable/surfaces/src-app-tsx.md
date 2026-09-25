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
- **User answers (2026-09-24)**: o story violeta era barulhento, não passava confiança, fluxo confuso e cansou. Foco: QR pronto rápido. Preservar apenas o nome "Faz o PIX!" e o tom coloquial. Story 1080×1920, dock e modo escuro deixam de ser obrigatórios. Anti-referências: story violeta/limão/rosa, comprovante térmico, e a Placa de Rodovia (construída em 2026-09-24 e rejeitada pelo usuário).

## Direction contract

THESIS: O app é a plaquinha de acrílico "Pague com Pix" do caixa: você monta e ela fica de pé, pronta para o cliente escanear. Recusa o palco barulhento e as placas de estrada.

OWN-WORLD: Parede clara (#eef1ef) sobre balcão de madeira clara (#c9b69a); display de acrílico transparente com borda polida e base, contendo um adesivo branco impresso; losango teal Pix (#1f9e92) só como marca do adesivo e foco; tinta quase preta (#0e1512) no botão principal. Figtree pesada no adesivo, normal nos campos. Reflexo do acrílico só na moldura, nunca sobre o QR.

STORY: A pessoa preenche chave, nome e cidade na etiqueta do balcão e vê a plaquinha se imprimir; com o QR pronto, copia o código ou baixa/compartilha a arte da plaquinha.

FIRST VIEWPORT: Celular: marca no topo, a plaquinha em pé no centro com "Pague com Pix", o QR, nome e valor, apoiada no balcão; abaixo, o cartão do formulário e "Copiar código Pix" em preto. Desktop: formulário à esquerda, cena da plaquinha fixa à direita.

SIGNATURE INTERACTION: O adesivo é "impresso" ao vivo: nome e valor trocam no adesivo; quando fica pronto, o QR desce para dentro do acrílico.

FORM: Plaquinha de Balcão, posição 1 da lista fundamentada (IMPECCABLE’S PICK), chave de seed 72c75d0a.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
