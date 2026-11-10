"use strict";
/* Cart math and mutations as pure functions returning explicit result codes. */

function createEmptyCartState() {
  return { businessSlug: null, items: [] };
}

function formatPriceCentsAsBRL(priceCents) {
  if (!Number.isInteger(priceCents)) { return ""; }
  var wholePart = Math.floor(priceCents / 100);
  var centsPart = String(priceCents % 100).padStart(2, "0");
  return "R$ " + String(wholePart).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + centsPart;
}

function calculateItemTotalCents(cartItem) {
  if (!cartItem || !Number.isInteger(cartItem.unitPriceCents)) { return 0; }
  var addonsTotalCents = (cartItem.selectedAddons || []).reduce(function (sum, addon) {
    return sum + (Number.isInteger(addon.priceCents) ? addon.priceCents : 0);
  }, 0);
  return (cartItem.unitPriceCents + addonsTotalCents) * (cartItem.quantity || 0);
}

function calculateCartSubtotalCents(cartState) {
  if (!cartState || !Array.isArray(cartState.items)) { return 0; }
  return cartState.items.reduce(function (sum, cartItem) { return sum + calculateItemTotalCents(cartItem); }, 0);
}

function calculateCartTotalCents(cartState, deliveryMode, deliveryFeeCents) {
  var subtotalCents = calculateCartSubtotalCents(cartState);
  if (deliveryMode !== "delivery") { return subtotalCents; }
  return subtotalCents + (Number.isInteger(deliveryFeeCents) ? deliveryFeeCents : 0);
}

function countCartItems(cartState) {
  if (!cartState || !Array.isArray(cartState.items)) { return 0; }
  return cartState.items.reduce(function (sum, cartItem) { return sum + (cartItem.quantity || 0); }, 0);
}

function addItemToCartState(cartState, businessSlug, product, quantity, selectedAddons, noteText) {
  if (!product || typeof product.productSlug !== "string") { return { code: "ERROR_MISSING_PRODUCT", cartState: cartState }; }
  if (product.soldOut) { return { code: "ERROR_PRODUCT_SOLD_OUT", cartState: cartState }; }
  if (!Number.isInteger(quantity) || quantity < 1) { return { code: "ERROR_INVALID_QUANTITY", cartState: cartState }; }
  var safeCartState = cartState || createEmptyCartState();
  if (safeCartState.businessSlug && safeCartState.businessSlug !== businessSlug && safeCartState.items.length > 0) {
    return { code: "ERROR_CART_HAS_OTHER_BUSINESS", cartState: safeCartState };
  }
  var newCartItem = {
    productSlug: product.productSlug,
    productName: product.productName,
    unitPriceCents: product.priceCents,
    quantity: quantity,
    selectedAddons: selectedAddons || [],
    noteText: noteText || "",
    orderOnlyMinDays: product.orderOnlyMinDays || null
  };
  return {
    code: "SUCCESS_ITEM_ADDED",
    cartState: { businessSlug: businessSlug, items: safeCartState.items.concat([newCartItem]) }
  };
}

function changeItemQuantityInCartState(cartState, itemIndex, newQuantity) {
  if (!cartState || !Array.isArray(cartState.items) || itemIndex < 0 || itemIndex >= cartState.items.length) {
    return { code: "ERROR_ITEM_NOT_FOUND", cartState: cartState };
  }
  if (!Number.isInteger(newQuantity) || newQuantity < 0) { return { code: "ERROR_INVALID_QUANTITY", cartState: cartState }; }
  var updatedItems = cartState.items
    .map(function (cartItem, index) {
      if (index !== itemIndex) { return cartItem; }
      return Object.assign({}, cartItem, { quantity: newQuantity });
    })
    .filter(function (cartItem) { return cartItem.quantity > 0; });
  var updatedBusinessSlug = updatedItems.length > 0 ? cartState.businessSlug : null;
  return { code: "SUCCESS_QUANTITY_CHANGED", cartState: { businessSlug: updatedBusinessSlug, items: updatedItems } };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createEmptyCartState: createEmptyCartState,
    formatPriceCentsAsBRL: formatPriceCentsAsBRL,
    calculateItemTotalCents: calculateItemTotalCents,
    calculateCartSubtotalCents: calculateCartSubtotalCents,
    calculateCartTotalCents: calculateCartTotalCents,
    countCartItems: countCartItems,
    addItemToCartState: addItemToCartState,
    changeItemQuantityInCartState: changeItemQuantityInCartState
  };
}
