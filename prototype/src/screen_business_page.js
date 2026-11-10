"use strict";
/* Business page: cover, info, menu (food) or price list (pharmacy), product sheet. */

function buildTodayHoursText(business) {
  var weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var todayTurns = (business.weeklyHours || {})[weekdayKeys[new Date().getDay()]] || [];
  if (todayTurns.length === 0) { return "hoje: fechado"; }
  return "hoje: " + todayTurns.map(function (turn) { return turn[0] + " às " + turn[1]; }).join(" e ");
}

function buildBusinessHeadHtml(business, openStatus) {
  var coverStyle = "background: linear-gradient(135deg, " + business.coverGradient[0] + ", " + business.coverGradient[1] + ");";
  var deliveryText = business.deliveryAvailable
    ? "Entrega " + (business.deliveryFeeCents > 0 ? formatPriceCentsAsBRL(business.deliveryFeeCents) : "grátis") + (business.pickupAvailable ? " ou retirada" : "")
    : "Somente retirada no balcão";
  var statusLineHtml = openStatus.isOpenNow
    ? '<span class="status-chip chip-open">aberto</span> ' + escapeHtmlText(openStatus.closesLabel || "")
    : '<span class="status-chip chip-closed">fechado</span> ' + escapeHtmlText(openStatus.nextOpeningLabel || "");
  return '<div class="business-cover" style="' + coverStyle + '"><a class="back-button" href="#/categoria/' + business.categorySlug + '" aria-label="Voltar">←</a>' + business.coverEmoji + "</div>" +
    '<div class="business-head"><h1 class="screen-title">' + escapeHtmlText(business.businessName) + "</h1>" +
    '<div class="business-head-meta">' + statusLineHtml + "<br>" + escapeHtmlText(buildTodayHoursText(business)) + "<br>" +
    escapeHtmlText(deliveryText) + (business.avgPrepMinutes > 0 ? " — pedido fica pronto em ~" + business.avgPrepMinutes + " min" : "") + "<br>" +
    escapeHtmlText(business.addressLine) + "</div></div>" +
    '<div class="payment-chip-row">' + business.paymentMethods.map(function (paymentMethod) {
      return '<span class="payment-chip">' + escapeHtmlText(paymentMethod) + "</span>";
    }).join("") + "</div>" +
    (openStatus.isOpenNow ? "" : '<div class="closed-notice">Este comércio está fechado agora. Você pode ver o cardápio, mas o pedido só é enviado no horário de funcionamento.</div>');
}

function buildMenuSectionsHtml(business) {
  return business.menuSections.map(function (menuSection) {
    var productRows = menuSection.products.map(function (menuProduct) {
      var productTags = "";
      if (menuProduct.orderOnlyMinDays) { productTags += ' <span class="info-tag">sob encomenda, ' + menuProduct.orderOnlyMinDays + " dias</span>"; }
      if (menuProduct.soldOut) { productTags += ' <span class="info-tag">esgotado hoje</span>'; }
      return '<button class="menu-product-row' + (menuProduct.soldOut ? " product-sold-out" : "") + '" data-product-slug="' + menuProduct.productSlug + '">' +
        '<span class="menu-product-emoji" style="background:' + business.coverGradient[0] + '">' + (menuProduct.productEmoji || "🍽️") + "</span>" +
        '<span><span class="menu-product-name">' + escapeHtmlText(menuProduct.productName) + "</span>" + productTags +
        '<div class="menu-product-description">' + escapeHtmlText(menuProduct.productDescription) + "</div>" +
        '<div class="menu-product-price">' + formatPriceCentsAsBRL(menuProduct.priceCents) + "</div></span></button>";
    }).join("");
    return '<h2 class="section-heading">' + escapeHtmlText(menuSection.sectionName) + '</h2><div class="business-list">' + productRows + "</div>";
  }).join("");
}

function buildPharmacyProductsHtml(business) {
  var productRows = business.pharmacyProducts.map(function (pharmacyProduct) {
    var priceHtml = pharmacyProduct.quoteOnly
      ? '<button class="ghost-button" data-quote-only="1">Pedir orçamento</button>'
      : "<strong>" + formatPriceCentsAsBRL(pharmacyProduct.priceCents) + "</strong>";
    var prescriptionTag = pharmacyProduct.requiresPrescription ? ' <span class="info-tag tag-prescription">exige receita</span>' : "";
    return '<div class="pharmacy-price-row"><span>' + escapeHtmlText(pharmacyProduct.productName) + prescriptionTag +
      '<div class="price-updated-note">preço atualizado em ' + formatIsoDateAsPt(pharmacyProduct.priceUpdatedOn) + "</div></span><span>" + priceHtml + "</span></div>";
  }).join("");
  return '<h2 class="section-heading">Preços desta farmácia</h2><div class="business-list">' + productRows + "</div>" +
    '<div class="demo-footer-note">A compra é sempre concluída com a própria farmácia. Medicamentos com receita exigem a apresentação da receita.</div>';
}

function findMenuProductBySlug(business, productSlug) {
  var foundProduct = null;
  (business.menuSections || []).forEach(function (menuSection) {
    menuSection.products.forEach(function (menuProduct) {
      if (menuProduct.productSlug === productSlug) { foundProduct = menuProduct; }
    });
  });
  return foundProduct;
}

function renderBusinessScreen(screenRootElement, businessSlug) {
  var business = findDemoBusinessBySlug(businessSlug);
  if (!business) {
    screenRootElement.innerHTML = '<div class="empty-state">Comércio não encontrado. <a href="#/"><u>Voltar ao início</u></a></div>';
    return;
  }
  var openStatus = getBusinessOpenStatus(business.weeklyHours, new Date());
  var isPharmacyBusiness = Array.isArray(business.pharmacyProducts);
  screenRootElement.innerHTML = buildBusinessHeadHtml(business, openStatus) +
    (isPharmacyBusiness ? buildPharmacyProductsHtml(business) : buildMenuSectionsHtml(business) +
      '<div class="demo-footer-note">Toque em um produto para montar o pedido.</div>');

  screenRootElement.querySelectorAll("[data-product-slug]").forEach(function (productButton) {
    productButton.addEventListener("click", function () {
      var menuProduct = findMenuProductBySlug(business, productButton.getAttribute("data-product-slug"));
      if (!menuProduct) { return; }
      if (menuProduct.soldOut) { showToastMessage("Esse produto está esgotado hoje."); return; }
      openProductSheet(business, menuProduct);
    });
  });
  screenRootElement.querySelectorAll("[data-quote-only]").forEach(function (quoteButton) {
    quoteButton.addEventListener("click", function () {
      showToastMessage("No app real, abre o WhatsApp da farmácia para enviar a foto da receita.");
    });
  });
}

function openProductSheet(business, menuProduct) {
  var sheetOverlayElement = document.createElement("div");
  sheetOverlayElement.className = "sheet-overlay";
  var addonsHtml = (menuProduct.addons || []).map(function (addon, addonIndex) {
    return '<label class="addon-option"><input type="checkbox" data-addon-index="' + addonIndex + '"> ' +
      escapeHtmlText(addon.addonName) + " <span class=\"muted-text\">+" + formatPriceCentsAsBRL(addon.priceCents) + "</span></label>";
  }).join("");
  sheetOverlayElement.innerHTML = '<div class="product-sheet" role="dialog" aria-label="' + escapeHtmlText(menuProduct.productName) + '">' +
    '<h2 class="sheet-title">' + escapeHtmlText(menuProduct.productName) + "</h2>" +
    '<p class="muted-text">' + escapeHtmlText(menuProduct.productDescription) + "</p>" +
    (menuProduct.orderOnlyMinDays ? '<p class="muted-text"><span class="info-tag">sob encomenda</span> pedir com ' + menuProduct.orderOnlyMinDays + " dias de antecedência.</p>" : "") +
    (addonsHtml ? '<h3 class="section-heading" style="margin-left:0">Adicionais</h3>' + addonsHtml : "") +
    '<div class="field-group" style="margin:14px 0"><label class="field-label" for="sheet-note-input">Alguma observação?</label>' +
    '<input id="sheet-note-input" class="field-input" placeholder="Ex.: sem cebola"></div>' +
    '<div style="display:flex; align-items:center; justify-content:space-between; gap:12px">' +
    '<span class="quantity-stepper"><button type="button" data-step="-1" aria-label="Menos um">−</button>' +
    '<strong id="sheet-quantity-value">1</strong><button type="button" data-step="1" aria-label="Mais um">+</button></span>' +
    '<button class="primary-button" id="sheet-add-button" style="flex:1; margin:0"></button></div></div>';
  document.body.appendChild(sheetOverlayElement);

  var selectedQuantity = 1;
  function readSelectedAddons() {
    var selectedAddons = [];
    sheetOverlayElement.querySelectorAll("[data-addon-index]:checked").forEach(function (addonCheckbox) {
      selectedAddons.push(menuProduct.addons[Number(addonCheckbox.getAttribute("data-addon-index"))]);
    });
    return selectedAddons;
  }
  function refreshAddButtonLabel() {
    var previewTotalCents = calculateItemTotalCents({ unitPriceCents: menuProduct.priceCents, quantity: selectedQuantity, selectedAddons: readSelectedAddons() });
    document.getElementById("sheet-add-button").textContent = "Adicionar — " + formatPriceCentsAsBRL(previewTotalCents);
  }
  refreshAddButtonLabel();

  sheetOverlayElement.addEventListener("click", function (clickEvent) {
    if (clickEvent.target === sheetOverlayElement) { sheetOverlayElement.remove(); }
  });
  sheetOverlayElement.querySelectorAll("[data-step]").forEach(function (stepButton) {
    stepButton.addEventListener("click", function () {
      selectedQuantity = Math.max(1, selectedQuantity + Number(stepButton.getAttribute("data-step")));
      document.getElementById("sheet-quantity-value").textContent = String(selectedQuantity);
      refreshAddButtonLabel();
    });
  });
  sheetOverlayElement.querySelectorAll("[data-addon-index]").forEach(function (addonCheckbox) {
    addonCheckbox.addEventListener("change", refreshAddButtonLabel);
  });
  document.getElementById("sheet-add-button").addEventListener("click", function () {
    var noteText = document.getElementById("sheet-note-input").value.trim();
    var addResult = addProductToCurrentCart(business.businessSlug, menuProduct, selectedQuantity, readSelectedAddons(), noteText);
    if (addResult.code === "ERROR_CART_HAS_OTHER_BUSINESS") {
      var confirmSwitch = window.confirm("Seu carrinho tem itens de outro comércio. Esvaziar e começar um pedido aqui?");
      if (!confirmSwitch) { return; }
      clearCurrentCartState();
      addResult = addProductToCurrentCart(business.businessSlug, menuProduct, selectedQuantity, readSelectedAddons(), noteText);
    }
    if (addResult.code !== "SUCCESS_ITEM_ADDED") { showToastMessage("Não deu para adicionar esse item."); return; }
    sheetOverlayElement.remove();
    updateCartBadgeCount();
    showToastMessage("Adicionado. O carrinho está na aba de baixo.");
  });
}
