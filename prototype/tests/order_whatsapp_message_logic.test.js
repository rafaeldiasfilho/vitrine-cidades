"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildOrderWhatsappMessage, buildWhatsappShareLink } = require("../src/order_whatsapp_message_logic.js");

const SAMPLE_ORDER = {
  cityName: "Ibirá",
  businessName: "Lanchonete do Trevo",
  deliveryMode: "delivery",
  deliveryAddressLine: "Rua das Flores, 123",
  paymentMethodName: "Pix",
  customerName: "Rafael",
  deliveryFeeCents: 500,
  orderNoteText: "",
  items: [
    { productName: "X-salada", unitPriceCents: 1800, quantity: 1, selectedAddons: [{ addonName: "Bacon", priceCents: 300 }], noteText: "sem cebola" },
    { productName: "Refrigerante lata", unitPriceCents: 600, quantity: 2, selectedAddons: [], noteText: "" }
  ]
};

test("happy path: message carries business, items, addon, note, address, fee and total", () => {
  const messageResult = buildOrderWhatsappMessage(SAMPLE_ORDER);
  assert.equal(messageResult.code, "SUCCESS_MESSAGE_BUILT");
  assert.equal(messageResult.totalCents, 1800 + 300 + 1200 + 500);
  assert.match(messageResult.messageText, /\*Lanchonete do Trevo\*/);
  assert.match(messageResult.messageText, /1x X-salada - R\$ 21,00/);
  assert.match(messageResult.messageText, /com Bacon/);
  assert.match(messageResult.messageText, /obs: sem cebola/);
  assert.match(messageResult.messageText, /Entrega em: Rua das Flores, 123/);
  assert.match(messageResult.messageText, /\*Total: R\$ 38,00\*/);
  assert.match(messageResult.messageText, /Nome: Rafael/);
});

test("pickup message says balcony pickup and skips the delivery fee", () => {
  const pickupOrder = Object.assign({}, SAMPLE_ORDER, { deliveryMode: "pickup", deliveryAddressLine: "" });
  const messageResult = buildOrderWhatsappMessage(pickupOrder);
  assert.equal(messageResult.code, "SUCCESS_MESSAGE_BUILT");
  assert.match(messageResult.messageText, /Retirada no balcão/);
  assert.equal(messageResult.totalCents, 3300);
});

test("empty cart, missing name, missing address and missing payment are each rejected", () => {
  assert.equal(buildOrderWhatsappMessage(Object.assign({}, SAMPLE_ORDER, { items: [] })).code, "ERROR_EMPTY_CART");
  assert.equal(buildOrderWhatsappMessage(Object.assign({}, SAMPLE_ORDER, { customerName: "  " })).code, "ERROR_MISSING_CUSTOMER_NAME");
  assert.equal(buildOrderWhatsappMessage(Object.assign({}, SAMPLE_ORDER, { deliveryAddressLine: "" })).code, "ERROR_MISSING_DELIVERY_ADDRESS");
  assert.equal(buildOrderWhatsappMessage(Object.assign({}, SAMPLE_ORDER, { paymentMethodName: "" })).code, "ERROR_MISSING_PAYMENT_METHOD");
});

test("share link encodes the message and validates the number", () => {
  const linkResult = buildWhatsappShareLink("5517990000001", "Pedido *teste*");
  assert.equal(linkResult.code, "SUCCESS_LINK_BUILT");
  assert.match(linkResult.linkUrl, /^https:\/\/wa\.me\/5517990000001\?text=Pedido%20\*teste\*/);
  assert.equal(buildWhatsappShareLink("abc", "oi").code, "ERROR_INVALID_WHATSAPP_NUMBER");
  assert.equal(buildWhatsappShareLink("5517990000001", "").code, "ERROR_EMPTY_MESSAGE");
});
