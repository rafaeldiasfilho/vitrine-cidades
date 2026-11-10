"use strict";
/* Cart with checkout form, and the generated WhatsApp message screen. */

var SELECTED_DELIVERY_MODE = "delivery";

var CHECKOUT_ERROR_MESSAGES_BY_CODE = {
  ERROR_MISSING_CUSTOMER_NAME: "Escreva seu nome para o comércio saber de quem é o pedido.",
  ERROR_MISSING_DELIVERY_ADDRESS: "Para entrega, precisamos do endereço.",
  ERROR_MISSING_PAYMENT_METHOD: "Escolha como vai pagar.",
  ERROR_EMPTY_CART: "Seu carrinho está vazio."
};

function buildCartItemsHtml(cartBusiness) {
  var itemRows = CURRENT_CART_STATE.items.map(function (cartItem, itemIndex) {
    var addonsText = (cartItem.selectedAddons || []).map(function (addon) { return "com " + addon.addonName; }).join(", ");
    return '<div class="cart-item-row"><div class="cart-item-top"><span><strong>' + escapeHtmlText(cartItem.productName) + "</strong>" +
      (addonsText ? '<div class="muted-text">' + escapeHtmlText(addonsText) + "</div>" : "") +
      (cartItem.noteText ? '<div class="muted-text">obs: ' + escapeHtmlText(cartItem.noteText) + "</div>" : "") +
      "</span><strong>" + formatPriceCentsAsBRL(calculateItemTotalCents(cartItem)) + "</strong></div>" +
      '<div style="margin-top:8px"><span class="quantity-stepper">' +
      '<button type="button" data-cart-step="-1" data-item-index="' + itemIndex + '" aria-label="Menos um">−</button>' +
      "<strong>" + cartItem.quantity + "</strong>" +
      '<button type="button" data-cart-step="1" data-item-index="' + itemIndex + '" aria-label="Mais um">+</button></span></div></div>';
  }).join("");
  return '<div class="section-heading" style="margin-top:14px">Pedido em ' + escapeHtmlText(cartBusiness.businessName) + "</div>" +
    '<div class="business-list" style="margin-bottom:14px">' + itemRows + "</div>";
}

function buildCheckoutFormHtml(cartBusiness) {
  var deliveryModeButtons = "";
  if (cartBusiness.deliveryAvailable) { deliveryModeButtons += '<button type="button" data-delivery-mode="delivery">Entrega</button>'; }
  if (cartBusiness.pickupAvailable) { deliveryModeButtons += '<button type="button" data-delivery-mode="pickup">Retirada</button>'; }
  var paymentOptions = cartBusiness.paymentMethods.map(function (paymentMethod) {
    return '<option value="' + escapeHtmlText(paymentMethod) + '">' + escapeHtmlText(paymentMethod) + "</option>";
  }).join("");
  return '<div class="segmented-control">' + deliveryModeButtons + "</div>" +
    '<div class="field-group"><label class="field-label" for="checkout-name-input">Seu nome</label>' +
    '<input id="checkout-name-input" class="field-input" autocomplete="name">' +
    '<div class="field-error-text" id="error-customer-name"></div></div>' +
    '<div class="field-group" id="address-field-group"><label class="field-label" for="checkout-address-input">Endereço de entrega</label>' +
    '<input id="checkout-address-input" class="field-input" placeholder="Rua, número e referência">' +
    '<div class="field-error-text" id="error-delivery-address"></div></div>' +
    '<div class="field-group"><label class="field-label" for="checkout-payment-select">Pagamento</label>' +
    '<select id="checkout-payment-select" class="field-select">' + paymentOptions + "</select></div>" +
    '<div class="field-group"><label class="field-label" for="checkout-note-input">Observações do pedido</label>' +
    '<input id="checkout-note-input" class="field-input" placeholder="Opcional"></div>';
}

function buildCartTotalsHtml(cartBusiness) {
  var subtotalCents = calculateCartSubtotalCents(CURRENT_CART_STATE);
  var feeCents = SELECTED_DELIVERY_MODE === "delivery" ? cartBusiness.deliveryFeeCents : 0;
  return '<div class="totals-box"><div class="totals-line"><span>Itens</span><span>' + formatPriceCentsAsBRL(subtotalCents) + "</span></div>" +
    (SELECTED_DELIVERY_MODE === "delivery" ? '<div class="totals-line"><span>Taxa de entrega</span><span>' + (feeCents > 0 ? formatPriceCentsAsBRL(feeCents) : "grátis") + "</span></div>" : "") +
    '<div class="totals-line totals-grand"><span>Total</span><span>' + formatPriceCentsAsBRL(subtotalCents + feeCents) + "</span></div></div>";
}

function renderCartScreen(screenRootElement) {
  var cartBusiness = CURRENT_CART_STATE.businessSlug ? findDemoBusinessBySlug(CURRENT_CART_STATE.businessSlug) : null;
  if (!cartBusiness || CURRENT_CART_STATE.items.length === 0) {
    screenRootElement.innerHTML = '<div class="screen-header"><h1 class="screen-title">Carrinho</h1></div>' +
      '<div class="empty-state"><div class="empty-state-emoji">🛒</div>Seu carrinho está vazio.<br>Escolha um comércio no início e monte seu pedido.</div>' +
      '<div style="text-align:center"><a class="ghost-button" href="#/">Ver comércios</a></div>';
    return;
  }
  if (!cartBusiness.deliveryAvailable) { SELECTED_DELIVERY_MODE = "pickup"; }
  screenRootElement.innerHTML = '<div class="screen-header"><h1 class="screen-title">Carrinho</h1></div>' +
    buildCartItemsHtml(cartBusiness) + buildCheckoutFormHtml(cartBusiness) + buildCartTotalsHtml(cartBusiness) +
    '<button class="primary-button" id="generate-order-button">Gerar mensagem do pedido</button>' +
    '<div class="demo-footer-note">Na demonstração a mensagem é só exibida. No app real, ela abre direto no WhatsApp do comércio.</div>';

  function refreshDeliveryModeView() {
    screenRootElement.querySelectorAll("[data-delivery-mode]").forEach(function (modeButton) {
      modeButton.classList.toggle("segment-active", modeButton.getAttribute("data-delivery-mode") === SELECTED_DELIVERY_MODE);
    });
    document.getElementById("address-field-group").style.display = SELECTED_DELIVERY_MODE === "delivery" ? "" : "none";
    var totalsBoxElement = screenRootElement.querySelector(".totals-box");
    totalsBoxElement.outerHTML = buildCartTotalsHtml(cartBusiness);
  }
  refreshDeliveryModeView();

  screenRootElement.querySelectorAll("[data-delivery-mode]").forEach(function (modeButton) {
    modeButton.addEventListener("click", function () {
      SELECTED_DELIVERY_MODE = modeButton.getAttribute("data-delivery-mode");
      refreshDeliveryModeView();
    });
  });
  screenRootElement.querySelectorAll("[data-cart-step]").forEach(function (stepButton) {
    stepButton.addEventListener("click", function () {
      var itemIndex = Number(stepButton.getAttribute("data-item-index"));
      var currentItem = CURRENT_CART_STATE.items[itemIndex];
      changeCurrentCartItemQuantity(itemIndex, currentItem.quantity + Number(stepButton.getAttribute("data-cart-step")));
      renderCartScreen(screenRootElement);
    });
  });
  document.getElementById("generate-order-button").addEventListener("click", function () {
    handleGenerateOrderClick(cartBusiness);
  });
}

function handleGenerateOrderClick(cartBusiness) {
  document.querySelectorAll(".field-error-text").forEach(function (errorElement) { errorElement.classList.remove("error-visible"); });
  var messageResult = buildOrderWhatsappMessage({
    cityName: DEMO_CITY.cityName,
    businessName: cartBusiness.businessName,
    deliveryMode: SELECTED_DELIVERY_MODE,
    deliveryAddressLine: document.getElementById("checkout-address-input").value,
    paymentMethodName: document.getElementById("checkout-payment-select").value,
    customerName: document.getElementById("checkout-name-input").value,
    deliveryFeeCents: cartBusiness.deliveryFeeCents,
    orderNoteText: document.getElementById("checkout-note-input").value.trim(),
    items: CURRENT_CART_STATE.items
  });
  if (messageResult.code !== "SUCCESS_MESSAGE_BUILT") {
    var errorElementIdsByCode = { ERROR_MISSING_CUSTOMER_NAME: "error-customer-name", ERROR_MISSING_DELIVERY_ADDRESS: "error-delivery-address" };
    var errorElement = document.getElementById(errorElementIdsByCode[messageResult.code] || "");
    if (errorElement) {
      errorElement.textContent = CHECKOUT_ERROR_MESSAGES_BY_CODE[messageResult.code];
      errorElement.classList.add("error-visible");
      errorElement.scrollIntoView({ block: "center" });
    }
    if (!errorElement) { showToastMessage(CHECKOUT_ERROR_MESSAGES_BY_CODE[messageResult.code] || "Confira os dados do pedido."); }
    return;
  }
  LAST_GENERATED_ORDER = { messageText: messageResult.messageText, businessName: cartBusiness.businessName, whatsappNumber: cartBusiness.whatsappNumber };
  window.location.hash = "#/pedido-gerado";
}

function renderOrderMessageScreen(screenRootElement) {
  if (!LAST_GENERATED_ORDER) { window.location.hash = "#/carrinho"; return; }
  var messageAsHtml = escapeHtmlText(LAST_GENERATED_ORDER.messageText).replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>");
  screenRootElement.innerHTML = '<div class="screen-header"><a class="back-button" href="#/carrinho" aria-label="Voltar">←</a>' +
    '<h1 class="screen-title">Mensagem pronta</h1></div>' +
    '<p class="muted-text" style="margin:0 16px">É assim que o pedido chega no WhatsApp de ' + escapeHtmlText(LAST_GENERATED_ORDER.businessName) + ":</p>" +
    '<div class="whatsapp-preview-backdrop"><div class="whatsapp-bubble">' + messageAsHtml + "</div></div>" +
    '<button class="primary-button" id="copy-message-button">Copiar mensagem</button>' +
    '<div style="text-align:center; margin-bottom:10px"><a class="ghost-button" href="#/" id="new-order-link">Começar outro pedido</a></div>' +
    '<div class="demo-footer-note">Demonstração: o número do comércio é fictício, então o WhatsApp não abre de verdade.</div>';

  document.getElementById("copy-message-button").addEventListener("click", function () {
    try {
      navigator.clipboard.writeText(LAST_GENERATED_ORDER.messageText);
      showToastMessage("Mensagem copiada.");
    } catch (clipboardError) { showToastMessage("Não deu para copiar neste navegador."); }
  });
  document.getElementById("new-order-link").addEventListener("click", function () { clearCurrentCartState(); });
}
