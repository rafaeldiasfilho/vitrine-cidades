"use strict";
/* On-duty pharmacy screen: today, tomorrow and the next weeks. Also date helpers. */

var MONTH_NAMES_PT = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function formatIsoDateAsPt(isoDateText) {
  var parsedDate = parseIsoDateAtNoon(isoDateText);
  if (!parsedDate) { return ""; }
  return parsedDate.getDate() + " de " + MONTH_NAMES_PT[parsedDate.getMonth()];
}

function formatDateRangeAsPt(startDate, endDate) {
  if (startDate.getMonth() === endDate.getMonth()) {
    return startDate.getDate() + " a " + endDate.getDate() + " de " + MONTH_NAMES_PT[startDate.getMonth()];
  }
  return startDate.getDate() + " de " + MONTH_NAMES_PT[startDate.getMonth()] + " a " + endDate.getDate() + " de " + MONTH_NAMES_PT[endDate.getMonth()];
}

function buildGoogleMapsSearchLink(addressLine) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addressLine + ", " + DEMO_CITY.cityName + " " + DEMO_CITY.stateCode);
}

function buildDutyTodayCardHtml() {
  var todayDutyResult = findPharmacyOnDutyForDate(DEMO_PHARMACY_DUTY_ROTATION, new Date());
  if (todayDutyResult.code !== "SUCCESS_DUTY_FOUND") {
    return '<div class="empty-state">A escala de plantão ainda não foi cadastrada. Confirme por telefone com a sua farmácia.</div>';
  }
  var dutyPharmacy = findDemoBusinessBySlug(todayDutyResult.pharmacySlug);
  return '<div class="duty-today-card"><span class="duty-banner-label">De plantão até domingo</span>' +
    '<h2 class="duty-banner-name" style="font-size:22px">' + escapeHtmlText(dutyPharmacy.businessName) + "</h2>" +
    '<div class="business-head-meta">' + escapeHtmlText(dutyPharmacy.addressLine) + "<br>" + escapeHtmlText(dutyPharmacy.phoneLine) +
    "<br>Semana de " + formatDateRangeAsPt(todayDutyResult.periodStartDate, todayDutyResult.periodEndDate) + "</div>" +
    '<div style="display:flex; gap:8px; margin-top:12px">' +
    '<a class="ghost-button" href="' + buildGoogleMapsSearchLink(dutyPharmacy.addressLine) + '" target="_blank" rel="noopener">Como chegar</a>' +
    '<a class="ghost-button" href="#/loja/' + dutyPharmacy.businessSlug + '">Ver preços</a></div></div>';
}

function buildUpcomingWeeksHtml() {
  var upcomingResult = listUpcomingDutyPeriods(DEMO_PHARMACY_DUTY_ROTATION, new Date(), 4);
  if (upcomingResult.code !== "SUCCESS_PERIODS_LISTED") { return ""; }
  var weekRows = upcomingResult.periods.map(function (dutyPeriod, periodIndex) {
    var dutyPharmacy = findDemoBusinessBySlug(dutyPeriod.pharmacySlug);
    var weekLabel = periodIndex === 0 ? "Esta semana" : formatDateRangeAsPt(dutyPeriod.periodStartDate, dutyPeriod.periodEndDate);
    return '<div class="duty-week-row"><span class="muted-text">' + escapeHtmlText(weekLabel) + "</span><strong>" +
      escapeHtmlText(dutyPharmacy ? dutyPharmacy.businessName : dutyPeriod.pharmacySlug) + "</strong></div>";
  }).join("");
  return '<h2 class="section-heading">Próximas semanas</h2><div class="business-list">' + weekRows + "</div>";
}

function renderPharmacyDutyScreen(screenRootElement) {
  screenRootElement.innerHTML = '<div class="screen-header"><h1 class="screen-title">Farmácia de plantão</h1></div>' +
    buildDutyTodayCardHtml() + buildUpcomingWeeksHtml() +
    '<h2 class="section-heading">Todas as farmácias</h2>' +
    '<div class="business-list">' + DEMO_PHARMACIES.map(buildBusinessRowHtml).join("") + "</div>" +
    '<div class="demo-footer-note">A escala é cadastrada uma vez e o app calcula sozinho. Em caso de dúvida, confirme por telefone antes de sair de casa.</div>';
}
