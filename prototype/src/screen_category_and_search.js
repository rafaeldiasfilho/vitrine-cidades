"use strict";
/* Category listing and the search screen with pharmacy price comparison. */

function renderCategoryScreen(screenRootElement, categorySlug) {
  var category = findDemoCategoryBySlug(categorySlug);
  if (!category) {
    screenRootElement.innerHTML = '<div class="empty-state"><div class="empty-state-emoji">🤔</div>Categoria não encontrada. <a href="#/"><u>Voltar ao início</u></a></div>';
    return;
  }
  var categoryBusinesses = getAllDemoBusinesses().filter(function (business) { return business.categorySlug === categorySlug; });
  screenRootElement.innerHTML =
    '<div class="screen-header"><a class="back-button" href="#/" aria-label="Voltar">←</a>' +
    '<h1 class="screen-title">' + category.categoryEmoji + " " + escapeHtmlText(category.categoryName) + "</h1></div>" +
    (categoryBusinesses.length === 0
      ? '<div class="empty-state">Ainda não há comércios nesta categoria.</div>'
      : '<div class="business-list">' + categoryBusinesses.map(buildBusinessRowHtml).join("") + "</div>") +
    (categorySlug === "farmacias" ? '<div style="margin:14px 16px"><a class="ghost-button" href="#/farmacias">Ver escala de plantão</a></div>' : "");
}

function buildPharmacyOffersHtml(pharmacyOffers) {
  var offerRows = pharmacyOffers.map(function (offer) {
    var priceHtml = offer.quoteOnly
      ? '<span class="info-tag">sob orçamento</span>'
      : "<strong>" + formatPriceCentsAsBRL(offer.priceCents) + "</strong>";
    var prescriptionTag = offer.requiresPrescription ? ' <span class="info-tag tag-prescription">exige receita</span>' : "";
    return '<div class="pharmacy-price-row"><span>' + escapeHtmlText(offer.productName) + prescriptionTag +
      '<div class="price-updated-note">' + escapeHtmlText(offer.pharmacyName) + " — atualizado em " + formatIsoDateAsPt(offer.priceUpdatedOn) + "</div></span>" +
      "<span>" + priceHtml + "</span></div>";
  }).join("");
  return '<h2 class="section-heading">Preços nas farmácias (menor primeiro)</h2>' +
    '<div class="business-list">' + offerRows + "</div>";
}

function buildFoodMatchesHtml(foodMatches) {
  var matchRows = foodMatches.map(function (foodMatch) {
    return '<a class="business-row" href="#/loja/' + foodMatch.businessSlug + '">' +
      '<span class="business-row-emoji">' + (foodMatch.product.productEmoji || "🍽️") + "</span>" +
      "<span><span class=\"business-row-name\">" + escapeHtmlText(foodMatch.product.productName) + "</span>" +
      '<div class="business-row-meta">' + escapeHtmlText(foodMatch.businessName) + " — <strong>" + formatPriceCentsAsBRL(foodMatch.product.priceCents) + "</strong></div></span></a>";
  }).join("");
  return '<h2 class="section-heading">Nos cardápios</h2><div class="business-list">' + matchRows + "</div>";
}

function buildSearchResultsHtml(queryText) {
  var foodSearch = searchFoodProductMatches(DEMO_FOOD_BUSINESSES, queryText);
  var pharmacySearch = searchPharmacyProductOffers(DEMO_PHARMACIES, queryText);
  if (foodSearch.code === "ERROR_QUERY_TOO_SHORT") {
    return '<div class="empty-state">Digite pelo menos 2 letras.<br>Experimente “coxinha”, “açaí” ou “dipirona”.</div>';
  }
  var resultsHtml = "";
  if (foodSearch.matches.length > 0) { resultsHtml += buildFoodMatchesHtml(foodSearch.matches); }
  if (pharmacySearch.offers.length > 0) { resultsHtml += buildPharmacyOffersHtml(pharmacySearch.offers); }
  if (resultsHtml === "") {
    return '<div class="empty-state"><div class="empty-state-emoji">🔍</div>Nada encontrado com esse nome.<br>Tente outra palavra, ou navegue pelas categorias no início.</div>';
  }
  return resultsHtml;
}

function renderSearchScreen(screenRootElement) {
  screenRootElement.innerHTML =
    '<div class="screen-header"><h1 class="screen-title">Buscar na cidade</h1></div>' +
    '<div class="search-input-wrap"><input id="search-query-input" class="field-input" type="search" ' +
    'placeholder="Lanche, bolo, remédio…" autocomplete="off" aria-label="Buscar produto ou comércio"></div>' +
    '<div id="search-results-area"><div class="empty-state">Busque um produto e compare: a mesma dipirona pode ter preços diferentes em cada farmácia.</div></div>';

  var searchInputElement = document.getElementById("search-query-input");
  var searchResultsElement = document.getElementById("search-results-area");
  searchInputElement.addEventListener("input", function () {
    searchResultsElement.innerHTML = buildSearchResultsHtml(searchInputElement.value);
  });
  searchInputElement.focus();
}
