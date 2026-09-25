# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas físicas em geral (uso pessoal ocasional — dividir conta, receber de amigos/família) e autônomos ou pequenos negócios (freelancers, vendedores informais, prestadores de serviço) que precisam gerar um QR Code Pix rapidamente para cobrar. Ambos os públicos têm peso igual — não há priorização de um sobre o outro.

## Product Purpose

Faz o PIX! gera um QR Code Pix estático a partir da chave, nome e cidade do recebedor, opcionalmente com valor fixo, descrição, TXID e logo embutida. Sucesso é o usuário sair com um QR pronto para copiar, compartilhar, baixar (PNG/SVG) ou imprimir, no menor número de passos possível.

## Positioning

Simplicidade e velocidade: o app se diferencia de bancos e outros geradores de QR Pix por minimizar fricção — sem cadastro, sem login, poucos campos, fluxo direto até o QR. Privacidade (processamento 100% local) reforça essa proposta mas o argumento central é a rapidez/facilidade do fluxo.

## Operating Context

Tela única: cartão "Cobrar com Pix" com o QR (topo no celular, fixo à direita no desktop) e os dados da cobrança, com valor primeiro e recebedor recolhível quando salvo; dock de copiar no celular. Suporta modo claro/escuro, instalação como PWA (offline-first) e uso avulso sem necessidade de conta.

## Capabilities and Constraints

- Sem backend e sem contas de usuário: toda a geração do payload Pix (BR Code) e do QR acontece no navegador do usuário; nenhuma chave Pix ou dado pessoal é enviado a um servidor.
- Deploy como site estático (há Dockerfile + nginx.conf no repo); build via Vite/React/TypeScript.
- Persistência opcional (checkbox "lembrar meus dados") usa apenas localStorage do próprio navegador.
- Exporta em PNG, SVG, permite copiar o payload, compartilhar via Web Share API e imprimir um cartão.
- Suporta logo customizada embutida no centro do QR (com correção de erro nível H).

## Brand Commitments

Nome do produto: "Faz o PIX!". Preferência permanente: visual convencional de app de pagamento (padrão da categoria), no nível de Mercado Pago, Nubank e PicPay; verde de marca `#00806b`. Anti-referências: story violeta, comprovante térmico, placa de rodovia, plaquinha de balcão e metáforas decorativas. Copy em pt-BR, tom direto e coloquial ("Preencha só o que muda.").

## Evidence on Hand

Nenhuma prova social, depoimento ou caso de uso documentado no repositório — não inventar essas evidências em trabalho futuro.

## Product Principles

1. Fricção mínima: cada campo e cada etapa extra é custo; priorizar o caminho mais curto até o QR pronto.
2. Privacidade por padrão: nenhum dado sensível (chave Pix, nome, valor) sai do dispositivo do usuário.
3. Funciona para os dois públicos sem forçar identidade de marca comercial nem tom pessoal excessivo — a UI deve servir tanto o uso avulso quanto o uso recorrente de cobrança.
4. Sem contas, sem backend: qualquer novo recurso deve continuar rodando inteiramente client-side.
