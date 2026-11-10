"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { findPharmacyOnDutyForDate, listUpcomingDutyPeriods, countDaysBetweenDates, parseIsoDateAtNoon } = require("../src/pharmacy_duty_logic.js");

const SAMPLE_ROTATION = {
  anchorMondayDate: "2026-11-09",
  periodDays: 7,
  pharmacySlugsInOrder: ["pharmacy-a", "pharmacy-b", "pharmacy-c"]
};

test("anchor week belongs to the first pharmacy", () => {
  const dutyResult = findPharmacyOnDutyForDate(SAMPLE_ROTATION, new Date(2026, 10, 12, 15, 0));
  assert.equal(dutyResult.code, "SUCCESS_DUTY_FOUND");
  assert.equal(dutyResult.pharmacySlug, "pharmacy-a");
  assert.equal(countDaysBetweenDates(parseIsoDateAtNoon("2026-11-09"), dutyResult.periodStartDate), 0);
});

test("rotation cycles: third week goes to the third pharmacy, fourth wraps back to the first", () => {
  assert.equal(findPharmacyOnDutyForDate(SAMPLE_ROTATION, new Date(2026, 10, 25, 9, 0)).pharmacySlug, "pharmacy-c");
  assert.equal(findPharmacyOnDutyForDate(SAMPLE_ROTATION, new Date(2026, 11, 2, 9, 0)).pharmacySlug, "pharmacy-a");
});

test("a date before the anchor still resolves (negative modulo)", () => {
  const dutyResult = findPharmacyOnDutyForDate(SAMPLE_ROTATION, new Date(2026, 10, 5, 9, 0));
  assert.equal(dutyResult.code, "SUCCESS_DUTY_FOUND");
  assert.equal(dutyResult.pharmacySlug, "pharmacy-c");
});

test("upcoming periods list starts on the current week and keeps the order", () => {
  const listResult = listUpcomingDutyPeriods(SAMPLE_ROTATION, new Date(2026, 10, 10, 9, 0), 4);
  assert.equal(listResult.code, "SUCCESS_PERIODS_LISTED");
  assert.deepEqual(listResult.periods.map((period) => period.pharmacySlug), ["pharmacy-a", "pharmacy-b", "pharmacy-c", "pharmacy-a"]);
});

test("missing rotation and empty list return error codes", () => {
  assert.equal(findPharmacyOnDutyForDate(null, new Date()).code, "ERROR_MISSING_DUTY_ROTATION");
  assert.equal(findPharmacyOnDutyForDate({ anchorMondayDate: "2026-11-09", periodDays: 7, pharmacySlugsInOrder: [] }, new Date()).code, "ERROR_EMPTY_PHARMACY_LIST");
});

test("invalid anchor date returns an error code", () => {
  const brokenRotation = { anchorMondayDate: "not-a-date", periodDays: 7, pharmacySlugsInOrder: ["pharmacy-a"] };
  assert.equal(findPharmacyOnDutyForDate(brokenRotation, new Date()).code, "ERROR_INVALID_ANCHOR_DATE");
});
