"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createEmptyCartState, formatPriceCentsAsBRL, calculateCartTotalCents,
  addItemToCartState, changeItemQuantityInCartState, countCartItems
} = require("../src/cart_logic.js");

const SAMPLE_PRODUCT = { productSlug: "x-salada", productName: "X-salada", priceCents: 1800 };
const SOLD_OUT_PRODUCT = { productSlug: "suco", productName: "Suco", priceCents: 900, soldOut: true };

test("happy path: add item with addon, totals include addon, quantity and delivery fee", () => {
  const addResult = addItemToCartState(createEmptyCartState(), "lanchonete-demo", SAMPLE_PRODUCT, 2, [{ addonName: "Bacon", priceCents: 300 }], "");
  assert.equal(addResult.code, "SUCCESS_ITEM_ADDED");
  assert.equal(calculateCartTotalCents(addResult.cartState, "pickup", 500), 4200);
  assert.equal(calculateCartTotalCents(addResult.cartState, "delivery", 500), 4700);
  assert.equal(countCartItems(addResult.cartState), 2);
});

test("sold out product is rejected and cart stays unchanged", () => {
  const emptyCart = createEmptyCartState();
  const addResult = addItemToCartState(emptyCart, "lanchonete-demo", SOLD_OUT_PRODUCT, 1, [], "");
  assert.equal(addResult.code, "ERROR_PRODUCT_SOLD_OUT");
  assert.equal(addResult.cartState.items.length, 0);
});

test("mixing two businesses in one cart is rejected", () => {
  const firstAdd = addItemToCartState(createEmptyCartState(), "lanchonete-demo", SAMPLE_PRODUCT, 1, [], "");
  const secondAdd = addItemToCartState(firstAdd.cartState, "sorveteria-demo", SAMPLE_PRODUCT, 1, [], "");
  assert.equal(secondAdd.code, "ERROR_CART_HAS_OTHER_BUSINESS");
  assert.equal(secondAdd.cartState.items.length, 1);
});

test("invalid quantity is rejected", () => {
  assert.equal(addItemToCartState(createEmptyCartState(), "x", SAMPLE_PRODUCT, 0, [], "").code, "ERROR_INVALID_QUANTITY");
  assert.equal(addItemToCartState(createEmptyCartState(), "x", SAMPLE_PRODUCT, 1.5, [], "").code, "ERROR_INVALID_QUANTITY");
});

test("quantity change to zero removes the item and frees the cart for another business", () => {
  const addResult = addItemToCartState(createEmptyCartState(), "lanchonete-demo", SAMPLE_PRODUCT, 1, [], "");
  const changeResult = changeItemQuantityInCartState(addResult.cartState, 0, 0);
  assert.equal(changeResult.code, "SUCCESS_QUANTITY_CHANGED");
  assert.equal(changeResult.cartState.items.length, 0);
  assert.equal(changeResult.cartState.businessSlug, null);
});

test("price formatting uses Brazilian format", () => {
  assert.equal(formatPriceCentsAsBRL(1800), "R$ 18,00");
  assert.equal(formatPriceCentsAsBRL(123456), "R$ 1.234,56");
  assert.equal(formatPriceCentsAsBRL(null), "");
});
