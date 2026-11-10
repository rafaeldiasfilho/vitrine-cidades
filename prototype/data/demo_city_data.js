"use strict";
/* Demo city, categories and pharmacy duty rotation. All data fictional. */

var DEMO_CITY = {
  citySlug: "ibira-demo",
  cityName: "Ibirá",
  stateCode: "SP"
};

var DEMO_CATEGORIES = [
  { categorySlug: "lanchonetes", categoryName: "Lanchonetes", categoryEmoji: "🍔", categoryKind: "food" },
  { categorySlug: "comida-caseira", categoryName: "Comida caseira", categoryEmoji: "🍰", categoryKind: "food" },
  { categorySlug: "sorveterias", categoryName: "Sorveterias", categoryEmoji: "🍦", categoryKind: "food" },
  { categorySlug: "farmacias", categoryName: "Farmácias", categoryEmoji: "💊", categoryKind: "pharmacy" }
];

/* Weekly rotation: each pharmacy covers Monday through Sunday, in order. */
var DEMO_PHARMACY_DUTY_ROTATION = {
  anchorMondayDate: "2026-11-09",
  periodDays: 7,
  pharmacySlugsInOrder: ["farmacia-central-demo", "farmacia-sao-bento-demo", "drogaria-da-praca-demo"]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEMO_CITY: DEMO_CITY, DEMO_CATEGORIES: DEMO_CATEGORIES, DEMO_PHARMACY_DUTY_ROTATION: DEMO_PHARMACY_DUTY_ROTATION };
}
