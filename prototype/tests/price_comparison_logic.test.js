"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { searchPharmacyProductOffers, searchFoodProductMatches, normalizeSearchText } = require("../src/price_comparison_logic.js");

const SAMPLE_PHARMACIES = [
  { businessSlug: "pharmacy-a", businessName: "Farmácia A", pharmacyProducts: [
    { productName: "Dipirona 500 mg", priceCents: 850, priceUpdatedOn: "2026-11-08" },
    { productName: "Fórmula manipulada", priceCents: null, quoteOnly: true, priceUpdatedOn: "2026-11-08" }
  ] },
  { businessSlug: "pharmacy-b", businessName: "Farmácia B", pharmacyProducts: [
    { productName: "Dipirona 500 mg", priceCents: 790, priceUpdatedOn: "2026-11-09" }
  ] }
];

const SAMPLE_FOOD = [
  { businessSlug: "lanchonete", businessName: "Lanchonete do Trevo", menuSections: [
    { sectionName: "Lanches", products: [{ productSlug: "x-salada", productName: "X-salada", priceCents: 1800 }] }
  ] }
];

test("happy path: offers come sorted by price, cheapest first, quote-only last", () => {
  const searchResult = searchPharmacyProductOffers(SAMPLE_PHARMACIES, "dipirona");
  assert.equal(searchResult.code, "SUCCESS_OFFERS_FOUND");
  assert.deepEqual(searchResult.offers.map((offer) => offer.pharmacySlug), ["pharmacy-b", "pharmacy-a"]);
  const quoteSearch = searchPharmacyProductOffers(SAMPLE_PHARMACIES, "formula");
  assert.equal(quoteSearch.offers[0].quoteOnly, true);
});

test("search ignores accents and case", () => {
  assert.equal(normalizeSearchText("FÓRMULA"), "formula");
  assert.equal(searchPharmacyProductOffers(SAMPLE_PHARMACIES, "DIPIRONA").code, "SUCCESS_OFFERS_FOUND");
});

test("query shorter than 2 characters is rejected", () => {
  assert.equal(searchPharmacyProductOffers(SAMPLE_PHARMACIES, "d").code, "ERROR_QUERY_TOO_SHORT");
  assert.equal(searchFoodProductMatches(SAMPLE_FOOD, " ").code, "ERROR_QUERY_TOO_SHORT");
});

test("no result returns an explicit success-empty code, never undefined", () => {
  const searchResult = searchPharmacyProductOffers(SAMPLE_PHARMACIES, "xyzxyz");
  assert.equal(searchResult.code, "SUCCESS_NO_OFFERS");
  assert.deepEqual(searchResult.offers, []);
});

test("missing lists return error codes with empty results", () => {
  assert.equal(searchPharmacyProductOffers(null, "dipirona").code, "ERROR_MISSING_PHARMACY_LIST");
  assert.equal(searchFoodProductMatches(null, "coxinha").code, "ERROR_MISSING_BUSINESS_LIST");
});

test("food search matches by product and by business name", () => {
  assert.equal(searchFoodProductMatches(SAMPLE_FOOD, "salada").code, "SUCCESS_MATCHES_FOUND");
  assert.equal(searchFoodProductMatches(SAMPLE_FOOD, "trevo").matches.length, 1);
});
