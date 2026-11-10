"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { parseClockTimeToMinutes, getBusinessOpenStatus } = require("../src/business_hours_logic.js");

const SAMPLE_WEEKLY_HOURS = {
  sun: [], mon: [], tue: [["18:00", "23:30"]], wed: [["08:00", "12:00"], ["18:00", "23:30"]],
  thu: [["18:00", "23:30"]], fri: [["18:00", "00:30"]], sat: [["18:00", "00:30"]]
};

test("open during a normal evening turn", () => {
  const tuesdayEvening = new Date(2026, 10, 10, 19, 0); // 2026-11-10 is a Tuesday
  const openStatus = getBusinessOpenStatus(SAMPLE_WEEKLY_HOURS, tuesdayEvening);
  assert.equal(openStatus.code, "SUCCESS_OPEN");
  assert.equal(openStatus.isOpenNow, true);
  assert.equal(openStatus.closesLabel, "fecha às 23:30");
});

test("open past midnight on an overnight turn (Friday 18:00-00:30 reaches Saturday 00:15)", () => {
  const saturdayAfterMidnight = new Date(2026, 10, 14, 0, 15); // 2026-11-14 is a Saturday
  const openStatus = getBusinessOpenStatus(SAMPLE_WEEKLY_HOURS, saturdayAfterMidnight);
  assert.equal(openStatus.isOpenNow, true);
});

test("closed between two turns of the same day points to the next turn", () => {
  const wednesdayAfternoon = new Date(2026, 10, 11, 14, 0);
  const openStatus = getBusinessOpenStatus(SAMPLE_WEEKLY_HOURS, wednesdayAfternoon);
  assert.equal(openStatus.code, "SUCCESS_CLOSED");
  assert.equal(openStatus.nextOpeningLabel, "abre hoje às 18:00");
});

test("closed on a day off points to tomorrow", () => {
  const mondayNight = new Date(2026, 10, 9, 20, 0); // Monday is empty
  const openStatus = getBusinessOpenStatus(SAMPLE_WEEKLY_HOURS, mondayNight);
  assert.equal(openStatus.isOpenNow, false);
  assert.equal(openStatus.nextOpeningLabel, "abre amanhã às 18:00");
});

test("missing weekly hours fails safe as closed with an error code", () => {
  const openStatus = getBusinessOpenStatus(null, new Date(2026, 10, 10, 19, 0));
  assert.equal(openStatus.code, "ERROR_MISSING_WEEKLY_HOURS");
  assert.equal(openStatus.isOpenNow, false);
});

test("invalid clock text parses to null instead of breaking", () => {
  assert.equal(parseClockTimeToMinutes("25:00"), null);
  assert.equal(parseClockTimeToMinutes("abc"), null);
  assert.equal(parseClockTimeToMinutes(null), null);
  assert.equal(parseClockTimeToMinutes("08:30"), 510);
});
