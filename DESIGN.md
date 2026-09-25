---
name: Faz o PIX!
description: Gerador de QR Code Pix no padrão dos apps de pagamento, com fundo neutro, cartões brancos, QR central e um só verde de marca.
colors:
  brand: "#00806b"
  brand-press: "#006e5c"
  brand-ink: "#00745f"
  brand-soft: "#e6f6f3"
  on-brand: "#ffffff"
  page: "#f4f5f6"
  surface: "#ffffff"
  field: "#ffffff"
  ink: "#16181b"
  ink-soft: "#5b6068"
  ink-faint: "#6e737b"
  rule: "#e3e5e8"
  rule-strong: "#b9bdc4"
  chip: "#f1f2f4"
  focus: "#00806b"
  ok: "#00745f"
  error: "#c4122f"
  error-soft: "#fdecef"
  qr-paper: "#ffffff"
  dark-brand: "#19c2a6"
  dark-brand-press: "#14a78f"
  dark-brand-ink: "#5fdcc6"
  dark-brand-soft: "#16302b"
  dark-on-brand: "#06231e"
  dark-page: "#0f1113"
  dark-surface: "#1a1d20"
  dark-field: "#121416"
  dark-ink: "#f2f3f5"
  dark-ink-soft: "#b3b8bf"
  dark-ink-faint: "#9095a0"
  dark-rule: "#2a2e33"
  dark-rule-strong: "#4a5058"
  dark-chip: "#23272b"
  dark-focus: "#19c2a6"
  dark-ok: "#5fdcc6"
  dark-error: "#ff7088"
  dark-error-soft: "#3a1a20"
typography:
  display:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.7rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 850
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  input:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
  button:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 750
  label:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 650
  caption:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  check: "0.4rem"
  field: "0.85rem"
  amount: "1rem"
  qr: "1.1rem"
  card: "1.25rem"
  charge: "1.5rem"
  pill: "999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  gutter: "1rem"
  card: "1.15rem"
  column-gap: "2.5rem"
components:
  button-main:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.4rem"
    height: "3.4rem"
  button-main-hover:
    backgroundColor: "{colors.brand-press}"
    textColor: "{colors.on-brand}"
  button-soft:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.4rem"
    height: "3.25rem"
  button-line:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.4rem"
    height: "3.25rem"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0 1rem"
    height: "2.5rem"
  link-action:
    textColor: "{colors.brand-ink}"
    padding: "0 0.25rem"
    height: "2.5rem"
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "2.5rem"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.input}"
    rounded: "{rounded.field}"
    padding: "0 1rem"
    height: "3.25rem"
  input-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.ink}"
  amount-hero:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.amount}"
    padding: "0.35rem 1rem"
  amount-hero-focus:
    backgroundColor: "{colors.surface}"
  chip-quick:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 1rem"
    height: "2.4rem"
  chip-quick-hover:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-ink}"
  segmented:
    backgroundColor: "{colors.chip}"
    rounded: "{rounded.pill}"
    padding: "0.25rem"
  segmented-option:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    height: "2.35rem"
  segmented-option-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "1.15rem"
  charge:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.charge}"
    padding: "1.35rem 1.25rem 1.25rem"
  qr-frame:
    backgroundColor: "{colors.qr-paper}"
    rounded: "{rounded.qr}"
    padding: "0.85rem"
  avatar:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.pill}"
    size: "2.6rem"
  dock:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0.4rem"
---

# Design System: Faz o PIX!

## Overview

**Creative North Star: "O Padrão da Categoria, Bem Acabado"**

Faz o PIX! se parece com o que a pessoa já conhece do app do banco: fundo cinza-neutro, cartões brancos de canto generoso com sombra quase imperceptível, o QR no centro de um cartão "Cobrar com Pix", um valor grande editável e ações em pílula. A barra de acabamento são Mercado Pago, Nubank e PicPay. Não há conceito decorativo, cena ou metáfora: a confiança vem de parecer familiar e de cada detalhe estar resolvido (estados de foco, erro, validação, vazio, tema escuro).

A densidade é de app de pagamento: uma coluna no celular, com o cartão da cobrança no topo e os dados de quem recebe abaixo; no desktop, dados à esquerda e cartão da cobrança fixo à direita. A cor é quase toda neutra; um único verde de marca aparece só onde há ação, foco, seleção ou confirmação. A tipografia é uma só família, Figtree, com pesos altos nos títulos e no valor e numerais tabulares em tudo que é número.

O mundo anterior, "Plaquinha de Balcão" (plaquinha de acrílico sobre balcão de madeira, adesivo "Pague com Pix"), foi rejeitado pelo usuário por ser genérico, pouco profissional e atrasar o fluxo. Ele sobrevive aqui apenas como anti-referência, junto com story violeta, placa de rodovia, comprovante térmico, maquininha e passe de carteira.

**Key Characteristics:**
- Fundo neutro frio, cartões brancos, sombra ambiente leve.
- Um verde de marca, reservado a ação, foco, seleção e estado válido.
- Todo controle de ação em pílula; campos com canto médio; contêineres com canto de 20–24px.
- Figtree em pesos 600–850, numerais tabulares em valores e contadores.
- QR sempre em papel branco, nos dois temas.
- Tema escuro completo, com profundidade por camadas tonais.

## Colors

Paleta neutra e fria com um único acento verde-petróleo; o escuro espelha cada papel com um par próprio, sem inverter hierarquias.

### Primary
- **Verde de Marca** (`brand`): preenchimento do botão principal ("Copiar código Pix"), caixa de seleção marcada, cursor de texto, borda de hover em áreas de soltar arquivo e a palavra "PIX!" no logotipo. No escuro vira o verde claro `dark-brand`, com texto `dark-on-brand` quase preto sobre ele.
- **Verde Pressionado** (`brand-press`): hover do botão principal.
- **Verde Texto** (`brand-ink`): verde legível como texto sobre branco: links de ação (PNG, SVG, Imprimir), rótulos de botões suaves, inicial do avatar, "Chave válida" (`ok`).
- **Verde Névoa** (`brand-soft`): fundo das ações secundárias (Compartilhar, Editar, Concluir, Escolher imagem), do avatar e do hover dos chips de valor rápido.
- **Foco** (`focus`): igual ao verde de marca; contorno de foco a 55% de opacidade, halo de 4px a 16% nos campos, anel sólido de 2px no valor.

### Neutral
- **Cinza Fundo de App** (`page`): fundo de página; também é a `theme-color` do PWA.
- **Branco Cartão** (`surface`) e **Campo** (`field`): cartões, botão de ícone, dock, opção selecionada do segmentado; no escuro o campo (`dark-field`) fica mais fundo que o cartão.
- **Grafite** (`ink`): texto principal e títulos.
- **Grafite Médio** (`ink-soft`): subtítulos, rótulos de campo, resumo do recebedor, opções não selecionadas.
- **Cinza Apoio** (`ink-faint`): placeholders, contadores (16/25), o "R$" do valor e subtítulo de "Mais opções".
- **Linha Fina** (`rule`) e **Linha Firme** (`rule-strong`): borda de campo em repouso e em hover; tracejado de áreas vazias e de soltar arquivo.
- **Cinza Chip** (`chip`): fundo do valor, dos chips de valor rápido, do trilho do segmentado e do botão de limpar.
- **Papel do QR** (`qr-paper`): o branco fixo da moldura do QR.

### Estado
- **Vermelho Erro** (`error`) sobre **Rosa Erro** (`error-soft`): borda e fundo de campo inválido, nota de erro com ícone, ação "Remover".

### Named Rules
**A Regra do Verde Único.** O verde de marca aparece só em ação, foco, seleção, confirmação e na palavra "PIX!" do logotipo. Há um único preenchimento verde sólido por tela (o botão principal, ou sua cópia no dock); ações secundárias usam o Verde Névoa.

**A Regra do QR Sempre Branco.** O QR fica em papel branco (`qr-paper`) com borda fina de 1px na cor da Linha Fina clara, também no tema escuro. Um QR é lido por câmera e o escuro não pode tocá-lo.

## Typography

**Display Font:** Figtree Variable (com ui-sans-serif, system-ui, sans-serif)
**Body Font:** Figtree Variable (mesma família)

**Character:** Uma geométrica humanista, amigável e firme, usada em pesos altos para parecer app de banco moderno sem frieza corporativa.

### Hierarchy
- **Display** (800, 2.6rem, -0.02em, tabular): o valor editável dentro do cartão da cobrança. É o maior texto da tela.
- **Headline** (800, 1.35rem, 1.7rem a partir de 1024px, -0.02em): "Cobrar com Pix".
- **Wordmark** (850, 1.35rem, -0.02em): "Faz o PIX!" no topo, com "PIX!" em verde.
- **Title** (800, 1.15rem, -0.01em): títulos de seção fora dos cartões ("Quem recebe"); títulos internos de linha usam 700 no corpo.
- **Body** (400, 1rem) e **Body pequeno** (400, 0.875rem, entrelinha 1.625): subtítulos, textos de apoio e a nota de privacidade.
- **Input** (600, 1.05rem): texto digitado nos campos.
- **Button** (750, 1rem; 0.88rem no botão pequeno): rótulos de botões.
- **Label** (650, 0.85rem): rótulos de campo em Grafite Médio, em caixa normal.
- **Caption** (600, 0.75rem, tabular): contadores e dicas de campo à direita do rótulo.

### Named Rules
**A Regra do Numeral Tabular.** Valor, chips de valor rápido e contadores usam `tabular-nums`; números não dançam enquanto a pessoa digita.

**A Regra da Família Única.** Figtree para tudo, inclusive o cartão impresso. Hierarquia vem de peso e tamanho, nunca de uma segunda fonte.

## Layout

Celular primeiro, em uma coluna com gutter de 1rem (cabeçalho em 1.25rem): cabeçalho com logotipo e botão de tema, cartão da cobrança, título "Quem recebe", cartão do recebedor, cartão "Mais opções" e a nota de privacidade. O formulário respeita `max-width: 36rem` e reserva 7rem no fim para o dock.

A partir de 1024px vira grade de duas colunas dentro de `max-width: 72rem`: dados à esquerda (`minmax(0,1fr)`), cartão da cobrança à direita (`minmax(0,28rem)`), fixo com `position: sticky`, e 2.5rem entre colunas. A frase "Tudo gerado no seu aparelho" sobe para o cabeçalho e a nota de privacidade do rodapé some.

Ritmo: 0.5rem entre ações empilhadas, 0.75rem entre cartões, 1.25rem entre campos dentro de um cartão, 0.5rem entre rótulo, campo e nota. A partir de 640px, Nome e Cidade dividem uma linha (1.5fr / 1fr). Abaixo de 640px o segmentado aperta a fonte para 0.78rem e zera o espaço entre opções para caber numa linha.

O dock móvel é fixo a 0.75rem das bordas, acima da safe area inferior, e aparece só quando as ações do cartão saem da tela.

## Elevation & Depth

Híbrido discreto: no claro, cartões brancos se separam do fundo cinza por uma sombra ambiente dupla quase invisível; no escuro, a profundidade vem de camadas tonais (fundo `dark-page`, cartão `dark-surface`, campo `dark-field` mais fundo) e a sombra vira um fio de 1–2px.

### Shadow Vocabulary
- **Ambiente** (`box-shadow: 0 1px 2px rgba(22,24,27,0.04), 0 4px 16px rgba(22,24,27,0.05)`; escuro `0 1px 2px rgba(0,0,0,0.3)`): cartões, cartão da cobrança e botão de ícone.
- **Opção selecionada** (`box-shadow: 0 1px 3px rgba(22,24,27,0.12)`): opção ativa do segmentado, que sobe do trilho cinza.
- **Flutuante** (`box-shadow: 0 8px 28px rgba(22,24,27,0.18)`): só o dock móvel.
- **Contorno interno** (`box-shadow: inset 0 0 0 1.5px`): borda do botão de linha e hover do valor, sem mudar o tamanho da caixa.

### Named Rules
**A Regra da Sombra Ambiente.** Superfícies em repouso usam só a sombra ambiente. Sombra forte é exclusiva do que flutua sobre o conteúdo (o dock).

## Shapes

Três famílias de canto. Tudo que é ação clicável é pílula (999px): botões, chips, segmentado, botão de ícone, avatar e dock. Campos e áreas de arquivo têm canto médio (0.85rem). Contêineres têm canto generoso: cartões 1.25rem, cartão da cobrança 1.5rem, moldura do QR 1.1rem, valor 1rem. A caixa de seleção usa 0.4rem.

Bordas são finas e em cinza: 1.5px nos campos e na caixa de seleção, 1px na moldura do QR; tracejado de 1.5px só em áreas vazias ou de soltar (QR ainda não gerado, escolher logo).

### Named Rules
**A Regra da Pílula.** Se é ação, é pílula. Se recebe texto, tem canto médio. Se agrupa, tem canto de cartão.

## Components

### Buttons
- **Shape:** pílula (999px), altura mínima 3.25rem (3.4rem no principal; 2.5rem no pequeno), ícone de 20px à esquerda do rótulo.
- **Principal:** Verde de Marca com texto branco. Um por contexto: "Copiar código Pix" (vira "Código copiado" com ✓ por instantes).
- **Suave:** Verde Névoa com Verde Texto: Compartilhar, Editar, Concluir.
- **Linha:** branco com contorno interno de 1.5px em Linha Fina; usado no botão "QR" do dock.
- **Hover / Active:** principal escurece para Verde Pressionado; suave mistura 20% de verde; todos encolhem para `scale(0.98)` ao pressionar (140ms, `cubic-bezier(0.2,0.9,0.3,1)`). Desabilitado a 45% de opacidade.
- **Link de ação:** texto Verde Texto 0.9rem/700 com ícone de 16px, sublinhado no hover (PNG, SVG, Imprimir). Botão de texto sublinhado em 0.88rem/700 para ações pequenas dentro de campos.
- **Botão de ícone:** círculo branco de 2.5rem com sombra ambiente (alternar tema).

### Chips
- **Valor rápido:** pílula Cinza Chip, 2.4rem, 0.9rem/700 tabular ("+10", "+20", "+50", "+100"). Hover passa para Verde Névoa e Verde Texto.
- **Segmentado (tipo de chave):** trilho pílula Cinza Chip com cinco opções iguais; a selecionada vira pílula branca com sombra de seleção e texto Grafite. É `role="radiogroup"`.

### Cards / Containers
- **Corner Style:** 1.25rem (cartão) e 1.5rem (cartão da cobrança).
- **Background:** Branco Cartão.
- **Shadow Strategy:** sombra ambiente (ver Elevation & Depth).
- **Border:** nenhuma; divisória interna de 1px Linha Fina quando uma seção se abre.
- **Internal Padding:** 1.15rem no cartão; 1.35rem / 1.25rem no cartão da cobrança.

### Inputs / Fields
- **Style:** fundo Campo, borda 1.5px Linha Fina, canto 0.85rem, altura 3.25rem, texto 1.05rem/600. Rótulo acima à esquerda, contador ou dica à direita.
- **Hover / Focus:** borda passa a Linha Firme no hover; no foco, borda verde e halo de 4px com 16% de verde, sem outline.
- **Error:** borda e nota em Vermelho Erro, fundo Rosa Erro, ícone de alerta de 16px e `role="alert"`. Estado válido mostra "Chave válida" com ✓ em Verde Texto.
- **Caixa de seleção:** 1.4rem, canto 0.4rem, borda Linha Firme; marcada vira verde cheio com ✓ branco.
- **Arquivo:** faixa tracejada com pílula Verde Névoa "Escolher imagem" e nome do arquivo em Grafite Médio.

### Navigation
Tela única, sem navegação entre rotas. O cabeçalho carrega apenas o logotipo e o botão de tema (e, no desktop, a frase de privacidade com escudo). No celular, a navegação de apoio é o dock.

### Valor em Destaque
O valor é editado dentro do próprio cartão da cobrança: caixa Cinza Chip de canto 1rem com "R$" em Cinza Apoio (1.35rem/750) e o número em Display. Hover desenha contorno interno de 1.5px em Linha Firme; em foco a caixa vira branca com anel verde de 2px. Um botão circular de 2rem limpa o valor. A troca de valor desliza na vertical (0.4em, 200ms, `cubic-bezier(0.16,1,0.3,1)`).

### Cartão da Cobrança e QR
Título "Cobrar com Pix", subtítulo em Grafite Médio, QR central em moldura branca (máx. 15.5rem no celular, 18.5rem no desktop), valor, chips, linha do recebedor e ações. Sem dados suficientes, o lugar do QR vira um botão tracejado com ícone de QR, "Falta …" e "Preencher agora" em Verde Texto, que leva ao campo faltante. O QR entra com escala de 0.96 para 1 em mola (rigidez 300, amortecimento 28).

### Resumo do Recebedor
Com dados válidos e salvos, o cartão do recebedor recolhe para uma linha: avatar redondo Verde Névoa com a inicial, nome em 700, chave mascarada e cidade em Grafite Médio, e o botão pequeno "Editar".

### Dock Móvel
Pílula branca fixa na base com sombra flutuante: "Copiar código" (principal, flex) e "QR" (linha) que rola de volta ao cartão. Entra de baixo em mola; some no desktop.

## Do's and Don'ts

### Do:
- **Do** manter o fundo `page` (#f4f5f6) com cartões brancos de canto 1.25–1.5rem e a sombra ambiente.
- **Do** reservar o preenchimento verde sólido para uma única ação principal por contexto; secundárias em Verde Névoa.
- **Do** usar pílula para toda ação, canto 0.85rem para campos e numerais tabulares para valores e contadores.
- **Do** manter o QR em papel branco com borda fina nos dois temas.
- **Do** dar a todo estado um desenho: foco verde com halo, erro em vermelho com fundo rosado e ícone, válido com ✓ verde, vazio com tracejado e atalho para o campo.
- **Do** definir cada novo token de cor nos dois temas, `:root` e `:root[data-theme='dark']`.
- **Do** respeitar `prefers-reduced-motion`: transições caem para 1ms e as molas viram corte seco.

### Don't:
- **Don't** trazer de volta a "Plaquinha de Balcão": nada de plaquinha de acrílico, balcão de madeira, adesivo "Pague com Pix", losango inclinado como marca ou paleta verde-acinzentada daquele mundo.
- **Don't** usar story violeta, placa de rodovia, comprovante térmico, maquininha, passe de carteira ou qualquer cena ou metáfora decorativa.
- **Don't** pintar cartões, fundos ou títulos grandes de verde; o verde não é cor de superfície.
- **Don't** usar sombras duras deslocadas, bordas grossas escuras ou sombra forte em superfícies em repouso.
- **Don't** introduzir uma segunda família tipográfica.
- **Don't** colocar sobretítulos (kickers) em caixa alta acima dos títulos; o título fala sozinho.
