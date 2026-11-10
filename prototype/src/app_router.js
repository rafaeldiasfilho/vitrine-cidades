"use strict";
/* Hash routing, shared render helpers, toast, cart badge. Loads last. */

function escapeHtmlText(anyText) {
  return String(anyText == null ? "" : anyText)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function getAllDemoBusinesses() {
  return DEMO_FOOD_BUSINESSES.concat(DEMO_PHARMACIES);
}

function findDemoBusinessBySlug(businessSlug) {
  return getAllDemoBusinesses().find(function (business) { return business.businessSlug === businessSlug; }) || null;
}

function findDemoCategoryBySlug(categorySlug) {
  return DEMO_CATEGORIES.find(function (category) { return category.categorySlug === categorySlug; }) || null;
}

function buildOpenStatusChipHtml(business) {
  var openStatus = getBusinessOpenStatus(business.weeklyHours, new Date());
  if (openStatus.isOpenNow) { return '<span class="status-chip chip-open">aberto</span>'; }
  var closedText = openStatus.nextOpeningLabel ? "fechado, " + openStatus.nextOpeningLabel : "fechado";
  return '<span class="status-chip chip-closed">' + escapeHtmlText(closedText) + "</span>";
}

function buildBusinessRowHtml(business) {
  var deliveryText = business.deliveryAvailable ? "entrega " + (business.deliveryFeeCents > 0 ? formatPriceCentsAsBRL(business.deliveryFeeCents) : "grátis") : "só retirada";
  var coverStyle = "background: linear-gradient(135deg, " + business.coverGradient[0] + ", " + business.coverGradient[1] + ");";
  return '<a class="business-row" href="#/loja/' + escapeHtmlText(business.businessSlug) + '">' +
    '<span class="business-row-emoji" style="' + coverStyle + '">' + business.coverEmoji + "</span>" +
    "<span><span class=\"business-row-name\">" + escapeHtmlText(business.businessName) + "</span>" +
    '<div class="business-row-meta">' + escapeHtmlText(business.shortDescription) + "</div>" +
    '<div class="business-row-meta">' + buildOpenStatusChipHtml(business) + " " + escapeHtmlText(deliveryText) + "</div></span></a>";
}

function showToastMessage(messageText) {
  var toastElement = document.getElementById("toast-message");
  toastElement.textContent = messageText;
  toastElement.classList.add("toast-visible");
  window.clearTimeout(showToastMessage.hideTimerId);
  showToastMessage.hideTimerId = window.setTimeout(function () { toastElement.classList.remove("toast-visible"); }, 2600);
}

function updateCartBadgeCount() {
  var badgeElement = document.getElementById("nav-cart-badge");
  var itemsCount = countCartItems(CURRENT_CART_STATE);
  badgeElement.textContent = String(itemsCount);
  badgeElement.classList.toggle("badge-visible", itemsCount > 0);
}

function markActiveNavigationTab(routeName) {
  document.querySelectorAll(".nav-tab").forEach(function (tabElement) {
    var isActiveTab = tabElement.getAttribute("data-route-name") === routeName;
    if (isActiveTab) { tabElement.setAttribute("aria-current", "page"); }
    if (!isActiveTab) { tabElement.removeAttribute("aria-current"); }
  });
}

function renderCurrentRoute() {
  var screenRootElement = document.getElementById("screen-root");
  var hashParts = (window.location.hash || "#/").replace(/^#\//, "").split("/");
  var routeName = hashParts[0] || "";
  var routeParam = decodeURIComponent(hashParts[1] || "");

  if (routeName === "") { renderHomeScreen(screenRootElement); markActiveNavigationTab("home"); }
  else if (routeName === "categoria") { renderCategoryScreen(screenRootElement, routeParam); markActiveNavigationTab("home"); }
  else if (routeName === "loja") { renderBusinessScreen(screenRootElement, routeParam); markActiveNavigationTab("home"); }
  else if (routeName === "buscar") { renderSearchScreen(screenRootElement); markActiveNavigationTab("search"); }
  else if (routeName === "farmacias") { renderPharmacyDutyScreen(screenRootElement); markActiveNavigationTab("pharmacy"); }
  else if (routeName === "carrinho") { renderCartScreen(screenRootElement); markActiveNavigationTab("cart"); }
  else if (routeName === "pedido-gerado") { renderOrderMessageScreen(screenRootElement); markActiveNavigationTab("cart"); }
  else { renderHomeScreen(screenRootElement); markActiveNavigationTab("home"); }

  document.querySelector(".phone-screen").scrollTop = 0;
  updateCartBadgeCount();
}

window.addEventListener("hashchange", renderCurrentRoute);
window.addEventListener("DOMContentLoaded", function () {
  loadCartStateFromStorage();
  renderCurrentRoute();
});
