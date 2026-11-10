"use strict";
/* Fictional food businesses for the demo. Phone numbers are fake. */

var DEMO_FOOD_BUSINESSES = [
  {
    businessSlug: "lanchonete-do-trevo-demo",
    businessName: "Lanchonete do Trevo",
    categorySlug: "lanchonetes",
    shortDescription: "Lanches na chapa desde 2009",
    coverEmoji: "🍔",
    coverGradient: ["#FFE2A8", "#FFC527"],
    whatsappNumber: "5517990000001",
    addressLine: "Av. Brasil, 210 (fictício)",
    paymentMethods: ["Pix", "Dinheiro", "Cartão na entrega"],
    deliveryAvailable: true,
    pickupAvailable: true,
    deliveryFeeCents: 500,
    avgPrepMinutes: 40,
    isHighlighted: true,
    weeklyHours: {
      sun: [["18:00", "23:30"]], mon: [], tue: [["18:00", "23:30"]], wed: [["18:00", "23:30"]],
      thu: [["18:00", "23:30"]], fri: [["18:00", "00:30"]], sat: [["18:00", "00:30"]]
    },
    menuSections: [
      { sectionName: "Lanches", products: [
        { productSlug: "x-salada", productName: "X-salada", productDescription: "Pão, hambúrguer, queijo, alface e tomate", priceCents: 1800, productEmoji: "🍔",
          addons: [{ addonName: "Bacon", priceCents: 300 }, { addonName: "Ovo", priceCents: 200 }, { addonName: "Dobro de queijo", priceCents: 400 }] },
        { productSlug: "x-tudo", productName: "X-tudo", productDescription: "Completo: bacon, ovo, presunto e milho", priceCents: 2500, productEmoji: "🍔",
          addons: [{ addonName: "Dobro de carne", priceCents: 600 }] },
        { productSlug: "cachorro-quente", productName: "Cachorro-quente", productDescription: "Duas salsichas, molho da casa e batata palha", priceCents: 1500, productEmoji: "🌭" }
      ] },
      { sectionName: "Porções", products: [
        { productSlug: "batata-frita", productName: "Batata frita", productDescription: "Porção grande, serve duas pessoas", priceCents: 2200, productEmoji: "🍟",
          addons: [{ addonName: "Cheddar e bacon", priceCents: 700 }] }
      ] },
      { sectionName: "Bebidas", products: [
        { productSlug: "refri-lata", productName: "Refrigerante lata", productDescription: "Coca, Guaraná ou Fanta", priceCents: 600, productEmoji: "🥤" },
        { productSlug: "suco-laranja", productName: "Suco de laranja 500 ml", productDescription: "Feito na hora", priceCents: 900, productEmoji: "🍊", soldOut: true }
      ] }
    ]
  },
  {
    businessSlug: "doces-da-dona-cida-demo",
    businessName: "Doces da Dona Cida",
    categorySlug: "comida-caseira",
    shortDescription: "Bolos, doces de festa e marmitas por encomenda",
    coverEmoji: "🍰",
    coverGradient: ["#FFD9E0", "#F6A6B8"],
    whatsappNumber: "5517990000002",
    addressLine: "Rua das Palmeiras, 87 (fictício)",
    paymentMethods: ["Pix", "Dinheiro"],
    deliveryAvailable: false,
    pickupAvailable: true,
    deliveryFeeCents: 0,
    avgPrepMinutes: 0,
    isHighlighted: true,
    weeklyHours: {
      sun: [], mon: [["08:00", "17:00"]], tue: [["08:00", "17:00"]], wed: [["08:00", "17:00"]],
      thu: [["08:00", "17:00"]], fri: [["08:00", "17:00"]], sat: [["08:00", "12:00"]]
    },
    menuSections: [
      { sectionName: "Bolos", products: [
        { productSlug: "bolo-cenoura", productName: "Bolo de cenoura com chocolate", productDescription: "Inteiro, serve 12 fatias", priceCents: 4500, productEmoji: "🍰", orderOnlyMinDays: 2 },
        { productSlug: "bolo-fuba", productName: "Bolo de fubá cremoso", productDescription: "Inteiro, com goiabada", priceCents: 4000, productEmoji: "🍞", orderOnlyMinDays: 2 }
      ] },
      { sectionName: "Doces de festa", products: [
        { productSlug: "cento-brigadeiro", productName: "Cento de brigadeiro", productDescription: "100 unidades enroladas na hora", priceCents: 9000, productEmoji: "🍫", orderOnlyMinDays: 3 }
      ] },
      { sectionName: "Marmitas", products: [
        { productSlug: "marmita-do-dia", productName: "Marmita do dia", productDescription: "Cardápio muda todo dia; retirar até 11h30", priceCents: 1800, productEmoji: "🍱" }
      ] }
    ]
  },
  {
    businessSlug: "sorveteria-geladinho-demo",
    businessName: "Sorveteria Geladinho",
    categorySlug: "sorveterias",
    shortDescription: "Sorvete artesanal e açaí na praça",
    coverEmoji: "🍦",
    coverGradient: ["#CDEBDD", "#8FD6B4"],
    whatsappNumber: "5517990000003",
    addressLine: "Praça Central, 15 (fictício)",
    paymentMethods: ["Pix", "Dinheiro", "Cartão na loja"],
    deliveryAvailable: true,
    pickupAvailable: true,
    deliveryFeeCents: 400,
    avgPrepMinutes: 25,
    isHighlighted: false,
    weeklyHours: {
      sun: [["13:00", "22:00"]], mon: [["13:00", "22:00"]], tue: [["13:00", "22:00"]], wed: [["13:00", "22:00"]],
      thu: [["13:00", "22:00"]], fri: [["13:00", "23:00"]], sat: [["13:00", "23:00"]]
    },
    menuSections: [
      { sectionName: "Açaí", products: [
        { productSlug: "acai-500", productName: "Açaí 500 ml", productDescription: "Com banana e granola", priceCents: 1600, productEmoji: "🫐",
          addons: [{ addonName: "Leite em pó", priceCents: 300 }, { addonName: "Paçoca", priceCents: 300 }, { addonName: "Leite condensado", priceCents: 200 }] }
      ] },
      { sectionName: "Sorvetes", products: [
        { productSlug: "milkshake-400", productName: "Milk-shake 400 ml", productDescription: "Chocolate, morango ou ovomaltine", priceCents: 1400, productEmoji: "🥤" },
        { productSlug: "sundae", productName: "Sundae da casa", productDescription: "Duas bolas, calda e amendoim", priceCents: 1200, productEmoji: "🍨" }
      ] }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEMO_FOOD_BUSINESSES: DEMO_FOOD_BUSINESSES };
}
