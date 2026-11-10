# PRD — Protótipo clicável "Vitrine" (nome provisório)

Versão 1.0 · 2026-11-10 · Deriva do `../../DOCUMENTO-DO-PROJETO.md` (v0.2)

## Objetivo

Um protótipo **estático e clicável**, com comércios fictícios de Ibirá (SP), para:
1. Mostrar aos comerciantes da cidade-piloto como a vitrine deles ficaria.
2. Validar o fluxo do morador: achar o comércio → ver o cardápio → montar o pedido → mensagem pronta de WhatsApp.
3. Validar a farmácia de plantão e a comparação de preços.

**Não é o produto.** Não tem backend, login, pagamento nem dados reais. Abre com dois cliques no `index.html`, sem instalar nada.

## Usuários do protótipo

- **Rafael**, apresentando no notebook ou no celular.
- **Comerciante de Ibirá**, vendo a demonstração (precisa parecer confiável e simples).

## O que o protótipo demonstra

1. Início com: banner da farmácia de plantão hoje, categorias, "abertos agora", destaques.
2. Lista por categoria com situação aberto/fechado calculada pela hora real.
3. Página do comércio: capa, horários, entrega/retirada, formas de pagamento, cardápio por seções.
4. Produto com adicionais, quantidade e observação.
5. Carrinho → dados do pedido → **mensagem de WhatsApp gerada e exibida** (não abre o WhatsApp de verdade: números fictícios).
6. Busca por produto, com comparação de preço entre farmácias (menor primeiro, com data da última atualização).
7. Tela de plantão: hoje, amanhã e próximas semanas, calculadas por rodízio automático.
8. Produtos especiais: "sob encomenda" (comida caseira), "sob orçamento" (manipulados), "exige receita", "esgotado hoje".

## Regras de negócio

- **Aberto/fechado**: pelos horários semanais do comércio, com mais de um turno por dia e turno que vira a madrugada (ex.: 18:00–00:30). Fechado mostra quando abre de novo.
- **Plantão**: rodízio semanal (segunda a domingo) entre as farmácias, a partir de uma data-âncora. Nunca fica sem resposta para uma data futura.
- **Carrinho**: itens de **um comércio por vez**; trocar de comércio pede confirmação e esvazia.
- **Total** = soma de (preço + adicionais) × quantidade + taxa de entrega (só quando for entrega).
- **Mensagem de pedido**: nome do comércio, itens com adicionais, entrega ou retirada, endereço (se entrega), pagamento, total, nome do cliente, observações. Formato de WhatsApp (negrito com `*`).
- **Comparação de preço**: busca por nome (ignorando acento e maiúsculas), ordenada do menor preço; "sob orçamento" aparece por último, sem preço.

## Caminhos infelizes (obrigatórios no protótipo)

| Situação | Comportamento |
|---|---|
| Comércio fechado agora | Cardápio continua visível; aviso "fechado (abre …)"; pedido bloqueado com explicação |
| Produto esgotado | Não entra no carrinho; código `ERROR_PRODUCT_SOLD_OUT` |
| Carrinho com outro comércio | Confirmação antes de esvaziar; sem confirmação, nada muda |
| Pedido sem nome do cliente | Mensagem não gera; aviso no campo (`ERROR_MISSING_CUSTOMER_NAME`) |
| Entrega sem endereço | Mensagem não gera; aviso no campo (`ERROR_MISSING_DELIVERY_ADDRESS`) |
| Carrinho vazio no fechamento | Mensagem não gera (`ERROR_EMPTY_CART`) |
| Busca com menos de 2 letras | Não busca; dica na tela |
| Busca sem resultado | Estado vazio com orientação, nunca tela em branco |
| Horário não cadastrado | Trata como fechado, sem quebrar (`ERROR_MISSING_WEEKLY_HOURS`) |
| Preço de farmácia desatualizado | Mostra sempre a data da última atualização |

## Fora de escopo do protótipo

Login, painel do comerciante, painel do gestor, backend, pagamento online, notificações, abrir o WhatsApp de verdade, dados reais de comércios.
