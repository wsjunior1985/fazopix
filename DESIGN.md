---
name: Faz o PIX!
description: Gerador de QR Code Pix em que a cobrança é um story pronto para compartilhar.
colors:
  stage-violet: "#6b2bff"
  stage-violet-deep: "#5620d9"
  shape-pink: "#ff3d7f"
  acid-lime: "#c8ff00"
  acid-lime-press: "#b4e600"
  stage-white: "#ffffff"
  stage-lavender: "#e4d9ff"
  ink-black: "#0b0b0b"
  ink-soft: "#4a4458"
  ink-faint: "#6d6780"
  field-hover: "#f6f3ff"
  rule-soft: "#ddd6ee"
  chip-lilac: "#f1edfa"
  ok-green: "#0f7a3d"
  error-red: "#d6124a"
  error-soft: "#fde8ee"
  dark-field: "#16151a"
  dark-field-hover: "#1e1c24"
  dark-ink-soft: "#c9c4d6"
  dark-ink-faint: "#9d97ad"
  dark-rule-soft: "#2c2935"
  dark-chip: "#1c1a22"
  dark-ok: "#7ee2a0"
  dark-error: "#ff6b93"
  dark-error-soft: "#2a1119"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 8vw, 3.3rem)"
    fontWeight: 850
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 125"
  amount:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.1rem, 15vw, 6rem)"
    fontWeight: 850
    lineHeight: 0.92
    letterSpacing: "-0.035em"
    fontFeature: "tnum"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 750
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 550
    lineHeight: 1.5
  label:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 700
    lineHeight: 1.3
  meta:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    fontFeature: "tnum"
  sticker:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 112"
rounded:
  pill: "999px"
  sheet: "32px"
  qr-card: "28px"
  qr-slot: "20px"
  field: "16px"
  tool: "12px"
  check: "7px"
spacing:
  xs: "8px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  stage-gutter-mobile: "20px"
  stage-gutter-desktop: "48px"
components:
  button-primary:
    backgroundColor: "{colors.acid-lime}"
    textColor: "{colors.ink-black}"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.acid-lime-press}"
    textColor: "{colors.ink-black}"
  button-ghost-stage:
    backgroundColor: "transparent"
    textColor: "{colors.stage-white}"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "52px"
  button-ghost-stage-hover:
    backgroundColor: "{colors.stage-white}"
    textColor: "{colors.stage-violet}"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "42px"
  input:
    backgroundColor: "{colors.stage-white}"
    textColor: "{colors.ink-black}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 18px"
    height: "56px"
  input-amount:
    rounded: "{rounded.field}"
    padding: "0 18px 0 54px"
    height: "68px"
  segment-option:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "42px"
  segment-option-selected:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.stage-white}"
  quick-chip:
    backgroundColor: "{colors.chip-lilac}"
    textColor: "{colors.ink-black}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 15px"
    height: "40px"
  qr-card:
    backgroundColor: "{colors.stage-white}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.qr-card}"
    padding: "14px"
  sticker-waiting:
    backgroundColor: "{colors.stage-white}"
    textColor: "{colors.stage-violet}"
    typography: "{typography.sticker}"
    size: "120px"
  sticker-ready:
    backgroundColor: "{colors.acid-lime}"
    textColor: "{colors.ink-black}"
    typography: "{typography.sticker}"
    size: "120px"
  privacy-chip:
    backgroundColor: "{colors.stage-violet}"
    textColor: "{colors.stage-white}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  dock:
    backgroundColor: "{colors.ink-black}"
    rounded: "{rounded.pill}"
    padding: "8px"
---

# Design System: Faz o PIX!

## Overview

**Creative North Star: "Cobrança em Stories"**

A cobrança é uma peça de story, não um formulário. A tela se divide em dois papéis: o **palco**, um plano violeta elétrico chapado onde a peça se monta ao vivo (nome em display largo, valor gigante em limão, cartão branco do QR e um adesivo de estado), e a **gaveta**, a superfície neutra que carrega os campos. No celular a gaveta sobe por cima da base do palco como uma folha arredondada; no desktop o palco ocupa a coluna esquerda fixa (11fr) e a gaveta a direita (9fr). A mesma peça é exportada em canvas 1080×1920 com as mesmas cores, formas e tipografia.

O mundo é gráfico e chapado: cor plena, formas geométricas rosa-choque de vértice duro cortando as bordas do palco, contornos sólidos de 2px e pílulas. Profundidade vem de sobreposição e contraste de plano, nunca de sombra difusa, gradiente ou vidro. O movimento é de mola e tem função: o adesivo estoura e gira ao mudar de estado, o QR entra girando, o valor troca num deslize vertical.

O tema escuro troca só a gaveta (preto e grafites); o palco permanece violeta nos dois temas, porque é a peça.

**Key Characteristics:**
- Palco violeta chapado com formas rosa de vértice duro (disco, raio e cunha) sangrando pelas bordas.
- Limão ácido reservado para a ação principal, o valor e o estado pronto.
- Archivo variável: largo e pesadíssimo no display, largura normal nos campos.
- Pílulas e contornos sólidos de 2px; nenhuma sombra de elevação.
- QR sempre em cartão branco de 28px, em qualquer tema.
- Adesivo estrela de 12 pontas girado 12° que diz o estado em palavras.

## Colors

Paleta de pôster: um campo violeta saturado, um rosa-choque de forma, um limão ácido de ação, e preto e branco puros para tudo o mais.

### Primary
- **Violeta Palco** (`stage-violet`): o fundo inteiro do palco e da peça exportada, `theme-color` do PWA, cor de foco no tema claro e cor do texto do adesivo "aguardando". Nunca vira fundo de gaveta nem de campo.
- **Violeta Profundo** (`stage-violet-deep`): apenas hover do botão de ícone sobre o palco.

### Secondary
- **Rosa-Choque** (`shape-pink`): exclusivamente as formas geométricas do palco (disco no canto superior direito, raio na borda esquerda, cunha entrando pela direita), no app e no story. Não é cor de texto, botão ou estado.

### Tertiary
- **Limão Ácido** (`acid-lime`): botão primário "Copiar código Pix", a linha do valor, "PIX!" na marca, adesivo "PIX PRONTO", caixa de seleção marcada, seleção de texto e cor de foco no tema escuro.
- **Limão Pressionado** (`acid-lime-press`): hover do botão primário.

### Neutral
- **Preto Tinta** (`ink-black`): texto e contornos de 2px dos campos na gaveta clara, texto sobre limão, fundo da gaveta escura e fundo do dock móvel.
- **Branco** (`stage-white`): texto sobre o palco, fundo da gaveta clara e dos campos, cartão do QR (sempre).
- **Lavanda Palco** (`stage-lavender`): texto secundário sobre o palco ("Pix para", placeholder do nome, cidade no story).
- **Tinta Suave / Tinta Tênue** (`ink-soft`, `ink-faint`): subtítulos, opções de segmento inativas, metadados, placeholders e o prefixo "R$" do campo de valor.
- **Lilás Chip** (`chip-lilac`): fundo dos atalhos de valor e do aviso de privacidade no rodapé da gaveta.
- **Linha Suave** (`rule-soft`): contorno de opções inativas, divisórias da seção "Mais opções", borda tracejada do seletor de arquivo e alça da gaveta.
- **Hover de Campo** (`field-hover`): fundo do campo ao passar o cursor.
- **Estados** (`ok-green`, `error-red`, `error-soft`): "Chave válida", mensagens de erro e fundo de campo inválido, botão "Zerar".
- **Gaveta escura** (`dark-*`): o tema escuro remapeia campo, hover, tintas, linha, chip e estados para esses valores; a gaveta usa `ink-black` e o contorno dos campos vira branco.

### Named Rules
**A Regra do Limão Reservado.** Limão ácido só marca a ação principal, o valor e o estado pronto. Se um segundo botão ficar limão, a hierarquia acabou.

**A Regra do Rosa Mudo.** Rosa-choque é forma, não informação: nunca carrega texto, ícone ou estado.

**A Regra do Palco Fixo.** O palco é violeta em qualquer tema; o tema escuro muda apenas a gaveta.

## Typography

**Display Font:** Archivo Variable, eixo de largura auto-hospedado via `@fontsource-variable/archivo/wdth` (com ui-sans-serif, system-ui)
**Body Font:** Archivo Variable em largura normal (100%)

**Character:** Uma única família em dois registros. No palco, Archivo esticado a 125% e peso 850 com entrelinha 0,92 soa como cartaz de story; na gaveta, a mesma família em largura normal é calma e legível.

### Hierarchy
- **Display** (850, largura 125%, `clamp(2.1rem, 8vw, 3.3rem)` que encolhe com o tamanho do nome até `clamp(1.6rem, 5.4vw, 2.35rem)`, entrelinha 0,92, −0,035em, `text-wrap: balance`): o nome de quem recebe e a marca "Faz o PIX!".
- **Valor** (mesma voz display, algarismos tabulares, `clamp(3.1rem, 15vw, 6rem)` descendo até `clamp(2.1rem, 9.5vw, 4.2rem)` conforme o comprimento): a linha do valor em limão; sangra para baixo do adesivo em vez de quebrar.
- **Headline** (800, largura 112%, 1.9rem; 2.2rem a partir de `sm`; −0,03em): título da gaveta "Monte sua cobrança".
- **Title** (750, 0.95rem): texto dos botões e do botão de divulgação "Mais opções".
- **Body** (550, 1rem nos campos; 0.95rem no texto de apoio): conteúdo dos campos e subtítulos. O campo de valor sobe para 1.75rem, 800, largura 112%, tabular.
- **Label** (700, 0.85rem): rótulos de campo, opções de segmento, atalhos de valor.
- **Meta** (600, 0.75rem, tabular): contadores de caracteres e "Opcional".
- **Sticker** (800, largura 112%, cerca de 0.72rem, caixa alta, entrelinha 1,05): somente o texto do adesivo de estado.

### Named Rules
**A Regra das Duas Larguras.** Largura estendida (112% a 125%) pertence ao palco, ao título da gaveta e ao valor; campos, rótulos e texto corrido ficam em 100%.

**A Regra do Número Tabular.** Todo valor em reais, atalho de valor e contador usa algarismos tabulares.

## Layout

Mobile-first com duas superfícies empilhadas. No celular, o palco ocupa a primeira tela (margens de 20px, 32px a partir de `sm`), e a gaveta sobe 32px por cima da base do palco com cantos superiores de 32px e uma alça central de 44×5px. A partir de 1024px, a grade vira duas colunas `11fr / 9fr`: o palco fica fixo (`sticky`, altura total da viewport, margens de 48px) e a gaveta rola à direita com conteúdo limitado a `max-w-xl` (576px).

No palco, o conteúdo se organiza em coluna: marca e controles no topo, nome e valor, depois cartão do QR com as ações logo abaixo, numa coluna estreita de 19rem (16.5rem no desktop). O adesivo fica ancorado no canto superior direito do bloco de nome e reserva espaço à direita do texto.

Ritmo da gaveta: 24px entre grupos de campo, 8px entre rótulo e campo, 8 a 10px entre ações empilhadas. Nome e cidade dividem uma linha a partir de `sm`.

Quando o QR está pronto e as ações do palco saem da tela no celular, um dock em pílula preta aparece fixo a 12px das bordas, respeitando `env(safe-area-inset-bottom)`, com "Copiar código Pix" e um botão de voltar ao topo.

## Elevation & Depth

Sistema plano. Não há sombra de elevação em lugar nenhum. A profundidade vem de planos sobrepostos: formas rosa atrás do conteúdo do palco (camada isolada, `z-index: -1`), cartão branco do QR sobre o violeta, gaveta branca ou preta subindo por cima do palco, e o dock preto sobre a gaveta com contorno violeta de 2px. A única sombra existente é o anel de foco dos campos.

### Shadow Vocabulary
- **Anel de foco de campo** (`box-shadow: 0 0 0 4px color-mix(in srgb, var(--focus) 22%, transparent)`): somente campos em foco, junto da borda trocada para a cor de foco.

### Named Rules
**A Regra do Chapado.** Sem gradiente, sem vidro, sem sombra difusa. Separação se faz com cor plena, contorno sólido ou sobreposição de plano.

## Shapes

Duas linguagens convivem de propósito. Tudo que se toca é arredondado: pílulas (999px) para botões, segmentos, atalhos, chips e dock; campos com cantos de 16px; cartão do QR com 28px (56px no canvas de 1080px) e espaço reservado do QR com 20px e contorno tracejado. Tudo que decora o palco tem vértice duro: o raio e a cunha são `clip-path` poligonais e o adesivo é uma estrela de 12 pontas; o único decorativo curvo é o disco rosa.

Contornos são sólidos e grossos: 2px nos campos, botões fantasma, segmentos e caixa de seleção; 1.5px nos controles pequenos do palco (chip de privacidade e botão de ícone). Tracejado de 2px sinaliza espaço vazio a preencher (slot do QR, seletor de arquivo).

## Components

### Buttons
Pílulas firmes que afundam ao toque.
- **Shape:** pílula (999px), altura mínima de 52px, contorno de 2px.
- **Primary:** limão com texto preto, 750, 0.95rem, ícone de 20px à esquerda. Um por contexto: "Copiar código Pix".
- **Hover / Focus:** hover escurece para limão pressionado; `:active` reduz a 0.97 em 140ms com `cubic-bezier(0.2, 0.9, 0.3, 1)`; foco com contorno de 3px na cor de foco e afastamento de 3px.
- **Fantasma do palco:** contorno branco, texto branco, fundo transparente; hover inverte para fundo branco com texto violeta. Usado em "Baixar story", "Compartilhar" e "Editar dados".
- **Pequeno:** 42px, 0.82rem, 700, em trio de colunas `1fr 1fr 1.45fr` para PNG, SVG e Imprimir.
- **Desabilitado:** limão vira branco a 22% sobre o palco; fantasma cai para contorno a 30%.
- **Botão de texto:** sublinhado de 2px com afastamento de 0.25em, 700, 0.82rem, para ações menores na gaveta.

### Chips
- **Atalhos de valor:** pílula de 40px em lilás chip, 700, tabular; hover ganha contorno de 2px na cor de linha. "Zerar" é a variante transparente em vermelho de erro.
- **Chip de privacidade:** pílula sobre o palco, contorno branco a 55% de 1.5px, 600, 0.75rem, ícone de 14px; oculto abaixo de `sm`.

### Segmented Picker
- **Style:** pílulas de 42px com contorno de 2px em linha suave e texto em tinta suave.
- **State:** hover escurece contorno e texto; selecionada fica preenchida em tinta com texto na cor da gaveta (preta no claro, branca no escuro).

### Cards / Containers
- **Cartão do QR:** branco puro em qualquer tema, cantos de 28px, 14px de respiro, legenda "Escaneie no app do seu banco" em 700 abaixo do código. Logo opcional em placa branca no centro.
- **Espaço do QR:** antes de pronto, quadrado com tracejado branco a 60% e cantos de 20px, com o texto do que falta.
- **Aviso de privacidade:** bloco em lilás chip, cantos de 16px, 20px de respiro, ícone de escudo.
- **Mais opções:** divulgação delimitada por linhas de 2px em cima e embaixo, cabeçalho de 56px com seta que gira 180°.

### Inputs / Fields
- **Style:** 56px de altura, contorno sólido de 2px em tinta (branco no escuro), cantos de 16px, fundo de campo, 550 a 1rem.
- **Focus:** borda passa à cor de foco (violeta no claro, limão no escuro) com anel de 4px a 22%.
- **Error:** borda vermelha, fundo vermelho suave, nota com ícone de alerta; validação positiva com nota verde "Chave válida".
- **Valor:** 68px, 1.75rem, 800, largura 112%, tabular, com prefixo "R$" em tinta tênue.
- **Caixa de seleção:** 22px, cantos de 7px, contorno de 2px; marcada fica limão com check preto.
- **Seletor de arquivo:** faixa tracejada de 2px, cantos de 16px, com ação interna preenchida em tinta e cantos de 12px.

### Navigation
Aplicação de tela única: a navegação é o cabeçalho do palco (marca à esquerda; chip de privacidade e botão de ícone circular de 44px para alternar o tema à direita) e, no celular, o dock em pílula preta com contorno violeta de 2px que surge com mola quando as ações do palco rolam para fora da tela.

### Adesivo de estado (assinatura)
Estrela de 12 pontas por `clip-path`, 120px (102px no celular), girada 12°, texto em caixa alta que diz o estado em palavras. Aguardando: branco com texto violeta. Pronto: limão com texto preto, check e "PIX PRONTO". A troca entra com mola (`stiffness 320, damping 22`) partindo de escala 0.3 e −40°, e sai girando para +40°.

### Peça do story (assinatura)
Canvas 1080×1920 gerado no aparelho: fundo violeta, disco e formas rosa, marca com "PIX!" em limão, "Pix para" em lavanda seguido do nome em Archivo expandido 850, valor em limão, cartão branco do QR com cantos de 56px, legenda branca, cidade em caixa alta lavanda e o adesivo pronto girado 12°. Deve sempre reproduzir o palco, nunca um layout próprio.

## Do's and Don'ts

### Do:
- **Do** manter o palco em violeta chapado (`stage-violet`) com formas rosa sangrando pelas bordas, nos dois temas e na exportação.
- **Do** reservar limão ácido para a ação principal, o valor e o estado pronto.
- **Do** usar Archivo estendido (112% a 125%, 800 a 850) para voz de cartaz e largura normal para campos e texto corrido.
- **Do** desenhar controles como pílulas ou cantos de 16px com contorno sólido de 2px.
- **Do** manter o QR em cartão branco de 28px, com contraste máximo, em qualquer tema.
- **Do** usar mola (`stiffness 320, damping 22`) para entradas de estado e `cubic-bezier(0.16, 1, 0.3, 1)` em 220 a 260ms para deslizes e aberturas, sempre zerados com `prefers-reduced-motion`.
- **Do** dizer o estado em palavras no adesivo, não só por cor.

### Don't:
- **Don't** usar gradiente, vidro fosco ou sombra difusa em qualquer superfície.
- **Don't** colocar o formulário num card branco de fintech flutuando sobre o palco; a gaveta é uma superfície de borda a borda.
- **Don't** usar texturas de papel, recibo ou comprovante.
- **Don't** usar rosa-choque em texto, botões ou estados.
- **Don't** colocar um segundo botão limão no mesmo contexto.
- **Don't** escurecer o palco ou o cartão do QR no tema escuro.
