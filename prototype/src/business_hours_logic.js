"use strict";
/* Pure open/closed logic. Dates always arrive as parameters (testable). */

var WEEKDAY_KEYS_BY_JS_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var WEEKDAY_NAMES_PT_BY_JS_DAY = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function parseClockTimeToMinutes(clockTimeText) {
  if (typeof clockTimeText !== "string") { return null; }
  var clockParts = clockTimeText.split(":");
  if (clockParts.length !== 2) { return null; }
  var hoursValue = Number(clockParts[0]);
  var minutesValue = Number(clockParts[1]);
  if (!Number.isInteger(hoursValue) || !Number.isInteger(minutesValue)) { return null; }
  if (hoursValue < 0 || hoursValue > 23 || minutesValue < 0 || minutesValue > 59) { return null; }
  return hoursValue * 60 + minutesValue;
}

function isTurnCrossingMidnight(turnPair) {
  var openMinutes = parseClockTimeToMinutes(turnPair[0]);
  var closeMinutes = parseClockTimeToMinutes(turnPair[1]);
  if (openMinutes === null || closeMinutes === null) { return false; }
  return closeMinutes <= openMinutes;
}

function findActiveTurnForMinute(weeklyHours, jsDayIndex, minuteOfDay) {
  var todayKey = WEEKDAY_KEYS_BY_JS_DAY[jsDayIndex];
  var yesterdayKey = WEEKDAY_KEYS_BY_JS_DAY[(jsDayIndex + 6) % 7];
  var todayTurns = weeklyHours[todayKey] || [];
  var yesterdayTurns = weeklyHours[yesterdayKey] || [];
  var turnIndex;
  for (turnIndex = 0; turnIndex < todayTurns.length; turnIndex += 1) {
    var openMinutes = parseClockTimeToMinutes(todayTurns[turnIndex][0]);
    var closeMinutes = parseClockTimeToMinutes(todayTurns[turnIndex][1]);
    if (openMinutes === null || closeMinutes === null) { continue; }
    if (closeMinutes > openMinutes && minuteOfDay >= openMinutes && minuteOfDay < closeMinutes) {
      return { closesLabel: todayTurns[turnIndex][1] };
    }
    if (closeMinutes <= openMinutes && minuteOfDay >= openMinutes) {
      return { closesLabel: todayTurns[turnIndex][1] };
    }
  }
  for (turnIndex = 0; turnIndex < yesterdayTurns.length; turnIndex += 1) {
    if (!isTurnCrossingMidnight(yesterdayTurns[turnIndex])) { continue; }
    var overnightCloseMinutes = parseClockTimeToMinutes(yesterdayTurns[turnIndex][1]);
    if (overnightCloseMinutes !== null && minuteOfDay < overnightCloseMinutes) {
      return { closesLabel: yesterdayTurns[turnIndex][1] };
    }
  }
  return null;
}

function buildNextOpeningLabel(weeklyHours, referenceDate) {
  var minuteNow = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  var dayOffset;
  for (dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    var jsDayIndex = (referenceDate.getDay() + dayOffset) % 7;
    var dayTurns = weeklyHours[WEEKDAY_KEYS_BY_JS_DAY[jsDayIndex]] || [];
    var bestOpenText = null;
    var bestOpenMinutes = null;
    var turnIndex;
    for (turnIndex = 0; turnIndex < dayTurns.length; turnIndex += 1) {
      var openMinutes = parseClockTimeToMinutes(dayTurns[turnIndex][0]);
      if (openMinutes === null) { continue; }
      if (dayOffset === 0 && openMinutes <= minuteNow) { continue; }
      if (bestOpenMinutes === null || openMinutes < bestOpenMinutes) {
        bestOpenMinutes = openMinutes;
        bestOpenText = dayTurns[turnIndex][0];
      }
    }
    if (bestOpenText === null) { continue; }
    if (dayOffset === 0) { return "abre hoje às " + bestOpenText; }
    if (dayOffset === 1) { return "abre amanhã às " + bestOpenText; }
    return "abre " + WEEKDAY_NAMES_PT_BY_JS_DAY[jsDayIndex] + " às " + bestOpenText;
  }
  return null;
}

function getBusinessOpenStatus(weeklyHours, referenceDate) {
  if (!weeklyHours || typeof weeklyHours !== "object") {
    return { code: "ERROR_MISSING_WEEKLY_HOURS", isOpenNow: false, nextOpeningLabel: null, closesLabel: null };
  }
  var minuteOfDay = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  var activeTurn = findActiveTurnForMinute(weeklyHours, referenceDate.getDay(), minuteOfDay);
  if (activeTurn) {
    return { code: "SUCCESS_OPEN", isOpenNow: true, nextOpeningLabel: null, closesLabel: "fecha às " + activeTurn.closesLabel };
  }
  return { code: "SUCCESS_CLOSED", isOpenNow: false, nextOpeningLabel: buildNextOpeningLabel(weeklyHours, referenceDate), closesLabel: null };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseClockTimeToMinutes: parseClockTimeToMinutes,
    getBusinessOpenStatus: getBusinessOpenStatus,
    buildNextOpeningLabel: buildNextOpeningLabel
  };
}
