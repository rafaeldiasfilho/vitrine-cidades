"use strict";
/* Single cart state for the running app. localStorage is a convenience only. */

var CART_STORAGE_KEY = "vitrine_demo_cart_v1";
var CURRENT_CART_STATE = createEmptyCartState();
var LAST_GENERATED_ORDER = null; /* { messageText, businessName, whatsappNumber } */

function loadCartStateFromStorage() {
  try {
    var storedText = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedText) { return; }
    var parsedState = JSON.parse(storedText);
    if (parsedState && Array.isArray(parsedState.items)) { CURRENT_CART_STATE = parsedState; }
  } catch (storageError) { /* private mode etc.: keep in-memory cart */ }
}

function persistCartStateToStorage() {
  try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(CURRENT_CART_STATE)); } catch (storageError) { /* ignore */ }
}

function replaceCurrentCartState(newCartState) {
  CURRENT_CART_STATE = newCartState;
  persistCartStateToStorage();
  if (typeof updateCartBadgeCount === "function") { updateCartBadgeCount(); }
}

function clearCurrentCartState() {
  replaceCurrentCartState(createEmptyCartState());
}

function addProductToCurrentCart(businessSlug, product, quantity, selectedAddons, noteText) {
  var addResult = addItemToCartState(CURRENT_CART_STATE, businessSlug, product, quantity, selectedAddons, noteText);
  if (addResult.code === "SUCCESS_ITEM_ADDED") { replaceCurrentCartState(addResult.cartState); }
  return addResult;
}

function changeCurrentCartItemQuantity(itemIndex, newQuantity) {
  var changeResult = changeItemQuantityInCartState(CURRENT_CART_STATE, itemIndex, newQuantity);
  if (changeResult.code === "SUCCESS_QUANTITY_CHANGED") { replaceCurrentCartState(changeResult.cartState); }
  return changeResult;
}
