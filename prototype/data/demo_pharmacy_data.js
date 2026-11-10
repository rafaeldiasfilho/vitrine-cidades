"use strict";
/* Fictional pharmacies for the demo. Phone numbers are fake. */

var DEMO_PHARMACIES = [
  {
    businessSlug: "farmacia-central-demo",
    businessName: "Farmácia Central",
    categorySlug: "farmacias",
    shortDescription: "Medicamentos, manipulação e entrega em casa",
    coverEmoji: "💊",
    coverGradient: ["#D7E9DF", "#A9CDBB"],
    whatsappNumber: "5517990000011",
    addressLine: "Rua São João, 340 (fictício)",
    phoneLine: "(17) 3500-0001 (fictício)",
    paymentMethods: ["Pix", "Dinheiro", "Cartão na entrega"],
    deliveryAvailable: true,
    pickupAvailable: true,
    deliveryFeeCents: 0,
    avgPrepMinutes: 30,
    isHighlighted: false,
    weeklyHours: {
      sun: [["08:00", "12:00"]], mon: [["08:00", "22:00"]], tue: [["08:00", "22:00"]], wed: [["08:00", "22:00"]],
      thu: [["08:00", "22:00"]], fri: [["08:00", "22:00"]], sat: [["08:00", "20:00"]]
    },
    pharmacyProducts: [
      { productName: "Dipirona 500 mg (10 comprimidos)", priceCents: 850, priceUpdatedOn: "2026-11-08" },
      { productName: "Paracetamol 750 mg (20 comprimidos)", priceCents: 1190, priceUpdatedOn: "2026-11-08" },
      { productName: "Soro fisiológico 500 ml", priceCents: 780, priceUpdatedOn: "2026-11-05" },
      { productName: "Protetor solar FPS 50", priceCents: 4890, priceUpdatedOn: "2026-11-02" },
      { productName: "Amoxicilina 500 mg (21 cápsulas)", priceCents: 2590, requiresPrescription: true, priceUpdatedOn: "2026-11-08" },
      { productName: "Fórmula manipulada", priceCents: null, quoteOnly: true, priceUpdatedOn: "2026-11-08" }
    ]
  },
  {
    businessSlug: "farmacia-sao-bento-demo",
    businessName: "Farmácia São Bento",
    categorySlug: "farmacias",
    shortDescription: "A mais antiga da cidade, atendimento de família",
    coverEmoji: "⚕️",
    coverGradient: ["#DCE6F5", "#AFC6E8"],
    whatsappNumber: "5517990000012",
    addressLine: "Praça Central, 52 (fictício)",
    phoneLine: "(17) 3500-0002 (fictício)",
    paymentMethods: ["Pix", "Dinheiro", "Cartão na loja"],
    deliveryAvailable: true,
    pickupAvailable: true,
    deliveryFeeCents: 300,
    avgPrepMinutes: 45,
    isHighlighted: false,
    weeklyHours: {
      sun: [], mon: [["07:30", "19:00"]], tue: [["07:30", "19:00"]], wed: [["07:30", "19:00"]],
      thu: [["07:30", "19:00"]], fri: [["07:30", "19:00"]], sat: [["07:30", "13:00"]]
    },
    pharmacyProducts: [
      { productName: "Dipirona 500 mg (10 comprimidos)", priceCents: 790, priceUpdatedOn: "2026-11-09" },
      { productName: "Paracetamol 750 mg (20 comprimidos)", priceCents: 1250, priceUpdatedOn: "2026-11-09" },
      { productName: "Soro fisiológico 500 ml", priceCents: 820, priceUpdatedOn: "2026-10-28" },
      { productName: "Vitamina C efervescente (10 unidades)", priceCents: 1590, priceUpdatedOn: "2026-11-09" },
      { productName: "Amoxicilina 500 mg (21 cápsulas)", priceCents: 2440, requiresPrescription: true, priceUpdatedOn: "2026-11-09" }
    ]
  },
  {
    businessSlug: "drogaria-da-praca-demo",
    businessName: "Drogaria da Praça",
    categorySlug: "farmacias",
    shortDescription: "Preço baixo e perfumaria",
    coverEmoji: "🩹",
    coverGradient: ["#F3E2D9", "#E0BBA8"],
    whatsappNumber: "5517990000013",
    addressLine: "Rua do Comércio, 120 (fictício)",
    phoneLine: "(17) 3500-0003 (fictício)",
    paymentMethods: ["Pix", "Dinheiro"],
    deliveryAvailable: false,
    pickupAvailable: true,
    deliveryFeeCents: 0,
    avgPrepMinutes: 0,
    isHighlighted: false,
    weeklyHours: {
      sun: [], mon: [["08:00", "18:00"]], tue: [["08:00", "18:00"]], wed: [["08:00", "18:00"]],
      thu: [["08:00", "18:00"]], fri: [["08:00", "18:00"]], sat: [["08:00", "14:00"]]
    },
    pharmacyProducts: [
      { productName: "Dipirona 500 mg (10 comprimidos)", priceCents: 920, priceUpdatedOn: "2026-10-30" },
      { productName: "Protetor solar FPS 50", priceCents: 4590, priceUpdatedOn: "2026-11-01" },
      { productName: "Fralda geriátrica M (8 unidades)", priceCents: 3290, priceUpdatedOn: "2026-11-01" },
      { productName: "Fórmula manipulada", priceCents: null, quoteOnly: true, priceUpdatedOn: "2026-11-01" }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEMO_PHARMACIES: DEMO_PHARMACIES };
}
