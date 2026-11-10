# TECH_SPEC — Protótipo clicável "Vitrine"

Versão 1.0 · 2026-11-10

## Stack (estrita)

- HTML + CSS + JavaScript puro (ES2020), **sem build, sem dependências, sem npm install**.
- Abre por `file://` (dois cliques no `index.html`). Por isso: **scripts clássicos, nunca ES modules** (módulos falham em `file://`).
- Fonte Bricolage Grotesque via Google Fonts, com fallback de sistema (funciona offline).
- Testes: **`node --test`** (runner embutido do Node, v18+). Substitui o Jest do método para manter zero dependências; mesma função, mesmo loop.

**Proibido:** frameworks (React etc.), CDNs de JS, ES modules, localStorage obrigatório (só como conveniência com try/catch), qualquer chamada de rede além da fonte.

## Árvore de pastas (obrigatória)

```
prototype/
  index.html              casca única (SPA por hash)
  docs/PRD.md             este par de documentos
  docs/TECH_SPEC.md
  styles/styles_base.css      tokens, casca do celular, tipografia, navegação
  styles/styles_screens.css   estilos por tela
  data/demo_city_data.js          cidade, categorias, rodízio de plantão
  data/demo_food_businesses_data.js
  data/demo_pharmacy_data.js
  src/business_hours_logic.js     aberto/fechado + próxima abertura
  src/pharmacy_duty_logic.js      plantão por rodízio
  src/cart_logic.js               carrinho, totais, formatação de preço
  src/order_whatsapp_message_logic.js
  src/price_comparison_logic.js
  src/cart_state.js               estado do carrinho (memória + localStorage opcional)
  src/app_router.js               rotas por hash, toast, utilidades de DOM
  src/screen_home.js
  src/screen_category_and_search.js
  src/screen_business_page.js
  src/screen_cart_checkout.js
  src/screen_pharmacy_duty.js
  tests/<um .test.js por arquivo de lógica>
```

## Convenções (do método)

- Nomes longos, únicos e greppáveis, **código em inglês, textos de interface em pt-BR**.
- Arquivos pequenos (~100–150 linhas; dividir acima de 200 por responsabilidade).
- Guard clauses e retorno cedo; nada de if/else aninhado.
- Resultados explícitos: `{ code: "SUCCESS_…" | "ERROR_…", … }`. A interface decide o texto; a lógica devolve o código.
- Lógica **pura** (sem DOM, sem Date interno — a data entra por parâmetro) para ser testável.
- Cada arquivo de lógica termina com exportação dupla: global no navegador (declaração de função em script clássico) e `module.exports` quando `module` existir (para os testes).

## Contratos de dados

```js
// Comércio (alimentação e farmácia compartilham a base)
{ businessSlug, businessName, categorySlug, shortDescription, coverEmoji,
  coverGradient: [hex, hex], whatsappNumber /* fictício */, addressLine,
  paymentMethods: ["Pix", ...], deliveryAvailable, pickupAvailable,
  deliveryFeeCents, avgPrepMinutes, isHighlighted,
  weeklyHours: { sun|mon|...|sat: [["18:00","23:30"], ...] },   // [] = fechado
  menuSections: [{ sectionName, products: [Product] }] }        // só alimentação

// Product
{ productSlug, productName, productDescription, priceCents, productEmoji,
  soldOut?, orderOnlyMinDays?, addons?: [{ addonName, priceCents }] }

// Farmácia: base acima + pharmacyProducts:
{ productName, priceCents|null, quoteOnly?, requiresPrescription?, priceUpdatedOn: "YYYY-MM-DD" }

// Rodízio de plantão
{ anchorMondayDate: "2026-11-09", periodDays: 7, pharmacySlugsInOrder: [slug, ...] }

// Carrinho
{ businessSlug|null, items: [{ productSlug, productName, unitPriceCents,
  quantity, selectedAddons: [{ addonName, priceCents }], noteText }] }
```

## Rotas (hash)

`#/` início · `#/categoria/<slug>` · `#/loja/<slug>` · `#/buscar` · `#/farmacias` · `#/carrinho` · `#/pedido-gerado`

## Testes

- Espelho por arquivo de lógica em `tests/`, com `node:test` + `node:assert/strict`.
- Caminho feliz + os caminhos infelizes do PRD (mínimo 3 falhas por arquivo).
- Rodar: `node --test tests` dentro de `prototype/`. Todo ajuste em lógica roda os testes de novo antes de reportar pronto.

## Decisões de design (resumo)

Vitrine de mercado do interior: verde de toldo `#17603A`, amarelo sol `#FFC527`, tinta quente `#26221B`, fundo `#FBFAF7`, vermelho só no selo de plantão `#C7351B`. Display Bricolage Grotesque, corpo system-ui. Casca de celular (máx. 414px) centrada no desktop, tela cheia no celular. Um elemento memorável: o toldo listrado com barrado ondulado no topo do início; o resto quieto. Sem letras maiúsculas de etiqueta, sem setas decorativas, sem cartões idênticos com a mesma sombra.
