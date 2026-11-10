"use strict";
/* On-duty pharmacy by weekly rotation from an anchor Monday. Pure functions. */

var MILLISECONDS_PER_DAY = 86400000;

function parseIsoDateAtNoon(isoDateText) {
  if (typeof isoDateText !== "string") { return null; }
  var dateParts = isoDateText.split("-");
  if (dateParts.length !== 3) { return null; }
  var yearValue = Number(dateParts[0]);
  var monthValue = Number(dateParts[1]);
  var dayValue = Number(dateParts[2]);
  if (!Number.isInteger(yearValue) || !Number.isInteger(monthValue) || !Number.isInteger(dayValue)) { return null; }
  var parsedDate = new Date(yearValue, monthValue - 1, dayValue, 12, 0, 0);
  if (Number.isNaN(parsedDate.getTime())) { return null; }
  return parsedDate;
}

function normalizeDateToNoon(anyDate) {
  return new Date(anyDate.getFullYear(), anyDate.getMonth(), anyDate.getDate(), 12, 0, 0);
}

function countDaysBetweenDates(fromDate, toDate) {
  return Math.round((normalizeDateToNoon(toDate).getTime() - normalizeDateToNoon(fromDate).getTime()) / MILLISECONDS_PER_DAY);
}

function addDaysToDate(baseDate, daysToAdd) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + daysToAdd, 12, 0, 0);
}

function findPharmacyOnDutyForDate(dutyRotation, referenceDate) {
  if (!dutyRotation) { return { code: "ERROR_MISSING_DUTY_ROTATION" }; }
  var orderedSlugs = dutyRotation.pharmacySlugsInOrder;
  if (!Array.isArray(orderedSlugs) || orderedSlugs.length === 0) { return { code: "ERROR_EMPTY_PHARMACY_LIST" }; }
  var anchorDate = parseIsoDateAtNoon(dutyRotation.anchorMondayDate);
  if (anchorDate === null) { return { code: "ERROR_INVALID_ANCHOR_DATE" }; }
  var periodDays = dutyRotation.periodDays;
  if (!Number.isInteger(periodDays) || periodDays < 1) { return { code: "ERROR_INVALID_PERIOD_DAYS" }; }

  var daysSinceAnchor = countDaysBetweenDates(anchorDate, referenceDate);
  var periodIndex = Math.floor(daysSinceAnchor / periodDays);
  var slugIndex = ((periodIndex % orderedSlugs.length) + orderedSlugs.length) % orderedSlugs.length;
  var periodStartDate = addDaysToDate(anchorDate, periodIndex * periodDays);
  return {
    code: "SUCCESS_DUTY_FOUND",
    pharmacySlug: orderedSlugs[slugIndex],
    periodStartDate: periodStartDate,
    periodEndDate: addDaysToDate(periodStartDate, periodDays - 1)
  };
}

function listUpcomingDutyPeriods(dutyRotation, fromDate, periodsCount) {
  var firstResult = findPharmacyOnDutyForDate(dutyRotation, fromDate);
  if (firstResult.code !== "SUCCESS_DUTY_FOUND") { return { code: firstResult.code, periods: [] }; }
  var upcomingPeriods = [];
  var periodOffset;
  for (periodOffset = 0; periodOffset < periodsCount; periodOffset += 1) {
    var periodDate = addDaysToDate(firstResult.periodStartDate, periodOffset * dutyRotation.periodDays);
    var periodResult = findPharmacyOnDutyForDate(dutyRotation, periodDate);
    upcomingPeriods.push(periodResult);
  }
  return { code: "SUCCESS_PERIODS_LISTED", periods: upcomingPeriods };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseIsoDateAtNoon: parseIsoDateAtNoon,
    countDaysBetweenDates: countDaysBetweenDates,
    addDaysToDate: addDaysToDate,
    findPharmacyOnDutyForDate: findPharmacyOnDutyForDate,
    listUpcomingDutyPeriods: listUpcomingDutyPeriods
  };
}
