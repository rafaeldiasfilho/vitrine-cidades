"use strict";
/* Builds the WhatsApp order message. Self-contained on purpose (no cross-file deps). */

function formatOrderCentsAsBrlText(priceCents) {
  if (!Number.isInteger(priceCents)) { return ""; }
  var wholePart = Math.floor(priceCents / 100);
  var centsPart = String(priceCents % 100).padStart(2, "0");
  return "R$ " + String(wholePart).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + centsPart;
}

function computeOrderItemTotalCents(orderItem) {
  var addonsTotalCents = (orderItem.selectedAddons || []).reduce(function (sum, addon) {
    return sum + (Number.isInteger(addon.priceCents) ? addon.priceCents : 0);
  }, 0);
  return (orderItem.unitPriceCents + addonsTotalCents) * orderItem.quantity;
}

function buildOrderItemLines(orderItems) {
  var itemLines = [];
  orderItems.forEach(function (orderItem) {
    itemLines.push(orderItem.quantity + "x " + orderItem.productName + " - " + formatOrderCentsAsBrlText(computeOrderItemTotalCents(orderItem)));
    (orderItem.selectedAddons || []).forEach(function (addon) {
      itemLines.push("   com " + addon.addonName + " (" + formatOrderCentsAsBrlText(addon.priceCents) + ")");
    });
    if (orderItem.noteText) { itemLines.push("   obs: " + orderItem.noteText); }
    if (orderItem.orderOnlyMinDays) { itemLines.push("   sob encomenda: pedir com " + orderItem.orderOnlyMinDays + " dias de antecedência"); }
  });
  return itemLines;
}

function buildOrderWhatsappMessage(orderDetails) {
  if (!orderDetails) { return { code: "ERROR_MISSING_ORDER_DETAILS" }; }
  var orderItems = orderDetails.items;
  if (!Array.isArray(orderItems) || orderItems.length === 0) { return { code: "ERROR_EMPTY_CART" }; }
  if (typeof orderDetails.customerName !== "string" || orderDetails.customerName.trim() === "") {
    return { code: "ERROR_MISSING_CUSTOMER_NAME" };
  }
  var isDelivery = orderDetails.deliveryMode === "delivery";
  if (isDelivery && (typeof orderDetails.deliveryAddressLine !== "string" || orderDetails.deliveryAddressLine.trim() === "")) {
    return { code: "ERROR_MISSING_DELIVERY_ADDRESS" };
  }
  if (typeof orderDetails.paymentMethodName !== "string" || orderDetails.paymentMethodName === "") {
    return { code: "ERROR_MISSING_PAYMENT_METHOD" };
  }

  var itemsTotalCents = orderItems.reduce(function (sum, orderItem) { return sum + computeOrderItemTotalCents(orderItem); }, 0);
  var deliveryFeeCents = isDelivery && Number.isInteger(orderDetails.deliveryFeeCents) ? orderDetails.deliveryFeeCents : 0;

  var messageLines = ["*Pedido pela Vitrine de " + (orderDetails.cityName || "") + "*", "", "*" + orderDetails.businessName + "*", ""];
  messageLines = messageLines.concat(buildOrderItemLines(orderItems));
  messageLines.push("");
  if (isDelivery) {
    messageLines.push("Entrega em: " + orderDetails.deliveryAddressLine.trim());
    if (deliveryFeeCents > 0) { messageLines.push("Taxa de entrega: " + formatOrderCentsAsBrlText(deliveryFeeCents)); }
  }
  if (!isDelivery) { messageLines.push("Retirada no balcão"); }
  messageLines.push("Pagamento: " + orderDetails.paymentMethodName);
  messageLines.push("*Total: " + formatOrderCentsAsBrlText(itemsTotalCents + deliveryFeeCents) + "*");
  messageLines.push("");
  messageLines.push("Nome: " + orderDetails.customerName.trim());
  if (orderDetails.orderNoteText) { messageLines.push("Observações: " + orderDetails.orderNoteText); }

  return { code: "SUCCESS_MESSAGE_BUILT", messageText: messageLines.join("\n"), totalCents: itemsTotalCents + deliveryFeeCents };
}

function buildWhatsappShareLink(whatsappNumber, messageText) {
  if (typeof whatsappNumber !== "string" || !/^\d{10,15}$/.test(whatsappNumber)) { return { code: "ERROR_INVALID_WHATSAPP_NUMBER" }; }
  if (typeof messageText !== "string" || messageText === "") { return { code: "ERROR_EMPTY_MESSAGE" }; }
  return { code: "SUCCESS_LINK_BUILT", linkUrl: "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(messageText) };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    buildOrderWhatsappMessage: buildOrderWhatsappMessage,
    buildWhatsappShareLink: buildWhatsappShareLink
  };
}
