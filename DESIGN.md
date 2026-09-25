---
name: Faz o PIX!
description: Gerador de QR Code Pix em que você monta a plaquinha de acrílico "Pague com Pix" do balcão e ela fica de pé, pronta para escanear.
colors:
  pix: "#1f9e92"
  pix-deep: "#16786f"
  wall: "#eef1ef"
  counter: "#c9b69a"
  counter-edge: "#b39d7e"
  acrylic: "rgba(255, 255, 255, 0.5)"
  acrylic-edge: "rgba(255, 255, 255, 0.95)"
  acrylic-line: "rgba(14, 21, 18, 0.14)"
  sticker: "#ffffff"
  sticker-dash: "#b9c2be"
  card: "#ffffff"
  ink: "#0e1512"
  ink-soft: "#414b47"
  ink-faint: "#5d6763"
  rule: "#cfd6d3"
  chip: "#f1f4f2"
  error: "#c4122f"
  error-soft: "#fbe9ec"
  night-wall: "#151a18"
  night-counter: "#5a4a36"
  night-counter-edge: "#4a3c2b"
  night-acrylic: "rgba(255, 255, 255, 0.1)"
  night-acrylic-edge: "rgba(255, 255, 255, 0.5)"
  night-card: "#1d2320"
  night-ink: "#f2f5f3"
  night-ink-soft: "#c5cdc9"
  night-ink-faint: "#9aa5a0"
  night-rule: "#36403c"
  night-chip: "#262d2a"
  night-focus: "#4fd1c3"
  night-ok: "#6fdccf"
  night-error: "#ff7088"
  night-error-soft: "#3a1a20"
typography:
  display:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 850
    lineHeight: 1.25
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 850
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 850
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 700
  button:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 750
rounded:
  qr-slot: "0.5rem"
  sticker: "0.6rem"
  field: "0.8rem"
  button: "0.9rem"
  acrylic: "1.1rem"
  dock: "1.2rem"
  card: "1.25rem"
  full: "999px"
spacing:
  xs: "0.4rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
components:
  button-main:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 1.25rem"
    height: "3.6rem"
  button-line:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 1.25rem"
    height: "3.25rem"
  button-small:
    rounded: "{rounded.button}"
    padding: "0 0.75rem"
    height: "2.75rem"
  icon-button:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "2.5rem"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 1rem"
    height: "3.25rem"
  input-amount:
    rounded: "{rounded.field}"
    padding: "0 1rem 0 3rem"
    height: "3.75rem"
  input-invalid:
    backgroundColor: "{colors.error-soft}"
  segment-option:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    padding: "0 0.9rem"
    height: "2.5rem"
  segment-option-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
  quick-chip:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 0.95rem"
    height: "2.5rem"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "1.25rem"
  acrylic:
    backgroundColor: "{colors.acrylic}"
    rounded: "{rounded.acrylic}"
    padding: "0.75rem"
  sticker:
    backgroundColor: "{colors.sticker}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sticker}"
    padding: "1rem 1rem 1.1rem"
  dock:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.dock}"
    padding: "0.4rem"
---

# Design System: Faz o PIX!

## Overview

**Creative North Star: "Plaquinha de Balcão"**

O app é a plaquinha de acrílico "Pague com Pix" que fica em pé no caixa da padaria. A cena tem quatro materiais: a parede clara no alto, o balcão de madeira clara embaixo, o display de acrílico transparente com borda polida e base, e o adesivo branco impresso dentro dele. A pessoa preenche a etiqueta do balcão (o cartão do formulário) e vê o adesivo se imprimir ao vivo: nome e valor trocam no adesivo e, quando tudo está pronto, o QR desce para dentro do acrílico.

É um mundo calmo, de objeto real e de confiança. Os tons são neutros levemente esverdeados, a madeira aquece a metade de baixo da tela e o único sinal de cor é o teal do Pix. As superfícies são quase chapadas: o acrílico se lê pela borda clara e pelo contorno fino, não por vidro fosco nem por sombra. O reflexo polido corre só pela moldura, nunca por cima do QR.

No modo escuro, a parede e a madeira escurecem, o acrílico fica mais translúcido e a tinta vira quase branca. O adesivo não muda: continua branco com tinta quase preta, como um adesivo impresso de verdade.

**Key Characteristics:**
- Cena dividida em parede clara (em cima) e balcão de madeira com friso de 4px (embaixo).
- Plaquinha de acrílico com borda polida de 1.5px, contorno fino externo, brilho só no canto superior esquerdo e base mais larga que a placa.
- Adesivo branco invariável com losango teal, "Pague com Pix", QR, nome e valor.
- Figtree Variable pesada (850) no adesivo e nos títulos, e média (600 a 750) nos campos e botões.
- Cantos generosos e macios (0.6 a 1.25rem) e chips em pílula.
- Ação principal em tinta quase preta; o teal fica reservado ao sinal do Pix.

## Colors

É uma paleta de caixa de loja: parede cinza-esverdeada, madeira clara, acrílico transparente, adesivo branco e um único teal do Pix.

### Primary
- **Teal Pix** (pix): o losango da marca no adesivo, o anel de foco, o cursor de texto e a seleção (a 30%). No hover da ação principal, entra em 14% na mistura com a tinta.
- **Teal Pix Fundo** (pix-deep): o estado "ok" (nota "Chave válida", o "PIX!" da marca no cabeçalho) e a caixa de seleção marcada. No escuro, o estado ok passa para **Teal Noturno** (night-ok) e o foco para **Teal Claro** (night-focus).

### Neutral
- **Parede Clara** (wall): o fundo da página e a `theme-color` do PWA.
- **Madeira de Balcão** (counter) com **Friso de Madeira** (counter-edge): o tampo do balcão, onde ficam as ações e, no celular, o formulário. O friso é a borda superior de 4px e também a cor da barra de rolagem.
- **Acrílico** (acrylic), **Borda Polida** (acrylic-edge) e **Contorno do Acrílico** (acrylic-line): o corpo translúcido, a borda clara de 1.5px e o contorno externo de 1px da plaquinha e da base.
- **Adesivo** (sticker): o branco impresso dentro do acrílico. Nunca muda de tema.
- **Tracejado do Adesivo** (sticker-dash): a borda tracejada da área de espera do QR.
- **Etiqueta** (card): o cartão do formulário, os botões de contorno e o dock. Sobre o balcão claro, o cartão ganha 8% da madeira para não brilhar demais.
- **Tinta** (ink): texto, a ação principal, o segmento selecionado e as bordas no hover.
- **Grafite** (ink-soft) e **Grafite Claro** (ink-faint): rótulos, textos de apoio, contadores e placeholders. Sobre a madeira no celular, os dois escurecem um passo para manter o contraste.
- **Filete** (rule): bordas de campos, segmentos, botões de contorno e separadores.
- **Chip** (chip): o fundo dos atalhos de valor.
- **Vermelho Erro** (error) sobre **Rosa Erro** (error-soft): campo inválido, sua nota e a remoção do logo.
- **Noite** (night-*): os mesmos papéis no tema escuro.

### Named Rules
**The One Signal Rule.** O teal é o sinal do Pix: marca, foco e confirmação de que algo está válido ou pronto. Ele nunca é fundo de botão, de cartão ou de faixa.

**The Printed Sticker Rule.** O adesivo é branco (#ffffff) com tinta quase preta nos dois temas, e o QR sempre fica sobre ele. Os tons de apoio dentro do adesivo são fixos, não seguem o tema.

**The Ink Action Rule.** A ação principal ("Copiar código Pix") é tinta cheia: quase preta no claro e quase branca no escuro.

## Typography

**Display Font:** Figtree Variable (com ui-sans-serif, system-ui, sans-serif)
**Body Font:** Figtree Variable (mesma família)

**Character:** Uma família só, geométrica e simpática. Pesada e apertada quando é o texto impresso no adesivo, média e legível quando é campo de formulário.

### Hierarchy
- **Display** (850, 2rem, algarismos tabulares): o valor em reais no adesivo. Troca de valor deslizando 0.4em com fade em 200ms.
- **Headline** (850, 1.75rem até 2.1rem, lh 1.05, −0.02em, `text-wrap: balance`): o título do formulário. O nome da marca no cabeçalho usa o mesmo peso em 1.45rem.
- **Title** (850, 1.08 a 1.1rem): "Pague com Pix" e o nome de quem recebe no adesivo.
- **Body** (600, 1.05rem): o texto digitado nos campos. O parágrafo de introdução usa 500 em 1.02rem, e o valor digitado sobe para 800 em 1.6rem, tabular.
- **Label** (700, 0.85rem): rótulos de campo e botões de texto. As notas usam 650 em 0.82rem, e os contadores 600 em 0.75rem, tabular.
- **Button** (750, 0.98rem): botões, sem caixa alta. A ação principal usa 1.02rem, e os botões pequenos 0.85rem.

### Named Rules
**The Printed Voice Rule.** Tudo que está impresso no adesivo, além dos títulos, usa 850 com −0.02em e entrelinha de 1.05. Campo e botão ficam entre 600 e 800.

**The Tabular Money Rule.** Todo valor em reais, contador e atalho de valor usa algarismos tabulares.

## Layout

É mobile-first. No celular, a ordem é: cabeçalho, a plaquinha centralizada na parede (largura máxima de 19.5rem), o balcão de madeira começando logo abaixo da base com as ações ("Copiar código Pix" e, abaixo, Enviar, PNG, SVG e Imprimir em grade de 3), e depois o formulário, que continua sobre a madeira. O cartão do formulário usa gap de 1.5rem entre os campos, e cada campo usa 0.5rem entre o rótulo e o controle.

A partir de 1024px, a página vira uma grade de duas colunas dentro de 80rem (a da direita com até 28rem, gap de 3rem): o formulário fica à esquerda, na parede, e a cena da plaquinha fica fixa à direita com a altura da viewport. A plaquinha fica apoiada no balcão, que sangra até a borda direita da janela. No desktop, a área de espera do QR vira um quadrado.

No celular, depois que o QR fica pronto, um dock fixo no rodapé (0.75rem das bordas, com `safe-area-inset-bottom`) mantém "Copiar" e "Ver o QR Code" à mão. Ele entra por baixo com mola e some a partir de 1024px.

## Elevation & Depth

A profundidade vem da cena, não de sombras empilhadas. O que separa os planos é a mudança de material (parede, madeira, acrílico, adesivo), o friso de 4px do balcão e as bordas claras do acrílico. Há só três sombras, cada uma com papel físico.

### Shadow Vocabulary
- **Adesivo colado** (`box-shadow: 0 1px 2px rgba(14, 21, 18, 0.12)`): a espessura mínima do adesivo sobre o acrílico.
- **Dock flutuante** (`box-shadow: 0 8px 24px rgba(14, 21, 18, 0.16)`): o único elemento que flutua sobre o conteúdo.
- **Anel de foco do campo** (`box-shadow: 0 0 0 4px color-mix(in srgb, var(--focus) 18%, transparent)`): um halo teal junto da borda teal.

### Named Rules
**The Frame-Only Gloss Rule.** O brilho polido (traço branco de 2px a 55%, só em cima e à esquerda) fica na moldura do acrílico, a 0.2rem da borda. Nada de reflexo, gradiente ou vidro fosco por cima do adesivo ou do QR.

## Shapes

Os cantos são macios e em camadas concêntricas: o acrílico tem 1.1rem de raio, o brilho interno 0.95rem, o adesivo 0.6rem e a área de espera do QR 0.5rem. A base do display é mais larga que a placa (−0.6rem de cada lado), não tem borda em cima e arredonda só embaixo (0.7rem). Os cartões do formulário usam 1.25rem, o dock 1.2rem, os botões 0.9rem e os campos 0.8rem. Segmentos, atalhos de valor e o botão de ícone são pílulas. As bordas são finas e uniformes, de 1.5px. O tracejado indica espera ou área de soltar: 2px na espera do QR e 1.5px no seletor de logo. A marca do Pix é um quadrado de cantos 0.2em girado 45°.

## Components

### Buttons
Os botões são sólidos e discretos, com peso de objeto de balcão.
- **Shape:** raio de 0.9rem, altura mínima de 3.25rem e ícone Lucide à esquerda, com gap de 0.55rem.
- **Principal:** tinta cheia, 3.6rem de altura e 1.02rem. No hover, a tinta recebe 14% de teal.
- **Contorno:** fundo de etiqueta, filete de 1.5px e tinta. No hover, o filete vira tinta.
- **Pequeno:** 2.75rem de altura, 0.85rem e padding de 0.75rem. É usado em Enviar, PNG, SVG e Imprimir.
- **Press:** `scale(0.97)` em 140ms com `cubic-bezier(0.2, 0.9, 0.3, 1)`. Desabilitado fica com 40% de opacidade.
- **Focus:** outline teal de 3px com afastamento de 3px em todo controle.
- **Ícone:** círculo de 2.5rem com filete. É usado na troca de tema.
- **Texto:** sublinhado de 1.5px com afastamento de 0.25em, 700 e 0.85rem.

### Chips
- **Tipo de chave:** pílula com filete de 1.5px, 2.5rem de altura, 700 e 0.88rem, em grafite. A selecionada fica com tinta cheia.
- **Atalho de valor (+10, +20…):** pílula em fundo chip, sem borda, 750 tabular. No hover ganha uma borda de tinta. "Zerar" é um botão de texto.

### Cards / Containers
- **Corner Style:** 1.25rem.
- **Background:** etiqueta (branca, com 8% de madeira sobre o balcão claro).
- **Shadow Strategy:** nenhuma. O cartão se destaca pela cor sobre a madeira ou a parede.
- **Border:** nenhuma. Divisões internas usam o filete.
- **Internal Padding:** 1.25rem. A seção recolhível "Mais opções" usa padding vertical de 0.25rem e um cabeçalho de 3.5rem.

### Inputs / Fields
- **Style:** fundo de etiqueta, filete de 1.5px, raio de 0.8rem, 3.25rem de altura, texto 600 em 1.05rem. No hover, a borda mistura 45% de tinta.
- **Focus:** borda teal com halo teal de 4px a 18%, sem outline.
- **Error:** borda vermelha sobre fundo rosa, com nota vermelha e ícone de alerta. A nota de validade é teal fundo com check.
- **Valor:** 3.75rem de altura, 800 em 1.6rem tabular, com o prefixo "R$" em grafite claro.
- **Seletor de logo:** área tracejada de 1.5px com um botão interno de tinta cheia (raio de 0.6rem).
- **Caixa de seleção:** quadrado de 1.4rem com raio de 0.4rem e borda de tinta. Marcada, fica em teal fundo com check branco.

### Navigation
Não há navegação: é uma tela única. O cabeçalho tem a marca à esquerda e, à direita, o selo "Fica no seu aparelho" (só no desktop) e o botão de tema. No celular, o dock cumpre o papel de barra inferior.

### Plaquinha de acrílico (assinatura)
Um display com três camadas: o acrílico (padding de 0.75rem, borda polida e contorno externo), o adesivo branco centralizado e a base. O adesivo traz o losango teal com "Pague com Pix", o QR (ou a área tracejada "Falta …" com "O QR aparece aqui.", que leva ao campo que falta), o nome, o valor e uma linha de instrução. O QR entra descendo 14px com mola (rigidez 300, amortecimento 28). O logo opcional fica num quadrado branco no centro do QR. Com movimento reduzido, tudo aparece sem animação. A impressão e a arte exportada repetem o mesmo adesivo.

## Do's and Don'ts

### Do:
- **Do** monte a cena com os materiais do balcão: parede, madeira com friso de 4px, acrílico com borda polida e adesivo branco.
- **Do** mantenha o adesivo branco (#ffffff) com tinta quase preta e o QR sobre ele em qualquer tema.
- **Do** reserve o teal para a marca, o foco e os estados de validade ou prontidão.
- **Do** use tinta cheia para a ação principal e filete de 1.5px para as ações secundárias.
- **Do** use algarismos tabulares em todo valor e contador.
- **Do** respeite movimento reduzido: mola e deslize viram troca instantânea.

### Don't:
- **Don't** coloque reflexo, gradiente ou vidro fosco sobre o adesivo ou o QR. O brilho fica só na moldura.
- **Don't** use o teal como fundo de botão, cartão ou faixa.
- **Don't** traga de volta o palco violeta, limão e rosa do story, o comprovante térmico nem a placa verde de rodovia com contornos grossos e amarelo de advertência.
- **Don't** empilhe sombras para criar elevação. Fora o adesivo, o dock e o halo de foco, os planos se separam por material.
