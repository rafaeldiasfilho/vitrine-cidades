"use strict";
/* Search across pharmacies (price comparison) and food menus. Pure functions. */

var MINIMUM_SEARCH_QUERY_LENGTH = 2;

function normalizeSearchText(anyText) {
  if (typeof anyText !== "string") { return ""; }
  return anyText.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function searchPharmacyProductOffers(pharmacyBusinessList, queryText) {
  if (!Array.isArray(pharmacyBusinessList)) { return { code: "ERROR_MISSING_PHARMACY_LIST", offers: [] }; }
  var normalizedQuery = normalizeSearchText(queryText);
  if (normalizedQuery.length < MINIMUM_SEARCH_QUERY_LENGTH) { return { code: "ERROR_QUERY_TOO_SHORT", offers: [] }; }

  var matchedOffers = [];
  pharmacyBusinessList.forEach(function (pharmacyBusiness) {
    (pharmacyBusiness.pharmacyProducts || []).forEach(function (pharmacyProduct) {
      if (normalizeSearchText(pharmacyProduct.productName).indexOf(normalizedQuery) === -1) { return; }
      matchedOffers.push({
        pharmacySlug: pharmacyBusiness.businessSlug,
        pharmacyName: pharmacyBusiness.businessName,
        productName: pharmacyProduct.productName,
        priceCents: pharmacyProduct.priceCents,
        quoteOnly: Boolean(pharmacyProduct.quoteOnly),
        requiresPrescription: Boolean(pharmacyProduct.requiresPrescription),
        priceUpdatedOn: pharmacyProduct.priceUpdatedOn
      });
    });
  });

  matchedOffers.sort(function (offerA, offerB) {
    if (offerA.quoteOnly !== offerB.quoteOnly) { return offerA.quoteOnly ? 1 : -1; }
    return (offerA.priceCents || 0) - (offerB.priceCents || 0);
  });

  if (matchedOffers.length === 0) { return { code: "SUCCESS_NO_OFFERS", offers: [] }; }
  return { code: "SUCCESS_OFFERS_FOUND", offers: matchedOffers };
}

function searchFoodProductMatches(foodBusinessList, queryText) {
  if (!Array.isArray(foodBusinessList)) { return { code: "ERROR_MISSING_BUSINESS_LIST", matches: [] }; }
  var normalizedQuery = normalizeSearchText(queryText);
  if (normalizedQuery.length < MINIMUM_SEARCH_QUERY_LENGTH) { return { code: "ERROR_QUERY_TOO_SHORT", matches: [] }; }

  var productMatches = [];
  foodBusinessList.forEach(function (foodBusiness) {
    var businessNameMatches = normalizeSearchText(foodBusiness.businessName).indexOf(normalizedQuery) !== -1;
    (foodBusiness.menuSections || []).forEach(function (menuSection) {
      menuSection.products.forEach(function (menuProduct) {
        var productNameMatches = normalizeSearchText(menuProduct.productName).indexOf(normalizedQuery) !== -1;
        if (!businessNameMatches && !productNameMatches) { return; }
        productMatches.push({
          businessSlug: foodBusiness.businessSlug,
          businessName: foodBusiness.businessName,
          product: menuProduct
        });
      });
    });
  });

  if (productMatches.length === 0) { return { code: "SUCCESS_NO_MATCHES", matches: [] }; }
  return { code: "SUCCESS_MATCHES_FOUND", matches: productMatches };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeSearchText: normalizeSearchText,
    searchPharmacyProductOffers: searchPharmacyProductOffers,
    searchFoodProductMatches: searchFoodProductMatches
  };
}
