"use strict";
/* Home: awning header, on-duty pharmacy banner, categories, open now, highlights. */

function buildDutyBannerHtml() {
  var dutyResult = findPharmacyOnDutyForDate(DEMO_PHARMACY_DUTY_ROTATION, new Date());
  if (dutyResult.code !== "SUCCESS_DUTY_FOUND") { return ""; }
  var dutyPharmacy = findDemoBusinessBySlug(dutyResult.pharmacySlug);
  if (!dutyPharmacy) { return ""; }
  return '<a class="duty-banner" href="#/farmacias">' +
    '<span class="duty-banner-label">Farmácia de plantão hoje</span>' +
    '<div class="duty-banner-name">' + escapeHtmlText(dutyPharmacy.businessName) + "</div>" +
    '<div class="duty-banner-address">' + escapeHtmlText(dutyPharmacy.addressLine) + " — toque para ver a semana</div></a>";
}

function buildCategoryGridHtml() {
  var categoryTiles = DEMO_CATEGORIES.map(function (category) {
    return '<a class="category-tile tile-' + category.categorySlug + '" href="#/categoria/' + category.categorySlug + '">' +
      '<span class="category-tile-emoji">' + category.categoryEmoji + "</span><span>" + escapeHtmlText(category.categoryName) + "</span></a>";
  }).join("");
  return '<div class="category-grid">' + categoryTiles + "</div>";
}

function buildOpenNowRailHtml() {
  var openBusinesses = getAllDemoBusinesses().filter(function (business) {
    return getBusinessOpenStatus(business.weeklyHours, new Date()).isOpenNow;
  });
  if (openBusinesses.length === 0) {
    return '<div class="empty-state">Nenhum comércio aberto neste horário. Os horários são reais: volte mais tarde ou veja os cardápios mesmo assim.</div>';
  }
  var openCards = openBusinesses.map(function (business) {
    return '<a class="open-now-card" href="#/loja/' + business.businessSlug + '">' +
      '<div class="open-now-emoji">' + business.coverEmoji + "</div>" +
      '<div class="open-now-name">' + escapeHtmlText(business.businessName) + "</div>" +
      '<div class="open-now-meta">' + (business.avgPrepMinutes > 0 ? "~" + business.avgPrepMinutes + " min" : "ver horários") + "</div></a>";
  }).join("");
  return '<div class="open-now-rail">' + openCards + "</div>";
}

function buildHighlightedBusinessesHtml() {
  var highlightedBusinesses = getAllDemoBusinesses().filter(function (business) { return business.isHighlighted; });
  if (highlightedBusinesses.length === 0) { return ""; }
  return '<h2 class="section-heading">Destaques da cidade</h2>' +
    '<div class="business-list">' + highlightedBusinesses.map(buildBusinessRowHtml).join("") + "</div>";
}

function renderHomeScreen(screenRootElement) {
  screenRootElement.innerHTML =
    '<header class="home-awning">' +
    '<h1 class="home-city-name">Vitrine de ' + escapeHtmlText(DEMO_CITY.cityName) + "</h1>" +
    '<div class="home-awning-subtitle">O comércio da cidade inteira na sua mão</div></header>' +
    '<div class="home-content">' +
    buildDutyBannerHtml() +
    '<h2 class="section-heading">O que você procura?</h2>' + buildCategoryGridHtml() +
    '<h2 class="section-heading">Abertos agora</h2>' + buildOpenNowRailHtml() +
    buildHighlightedBusinessesHtml() +
    '<div class="demo-footer-note">Demonstração com comércios, preços e telefones fictícios.</div></div>';
}
