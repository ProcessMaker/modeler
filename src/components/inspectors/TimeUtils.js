/**
 * @param {Date|DateTime|string} date
 * @returns {string}
 */
function toIsoDateTimeString(date) {

  if (date === null) {
    return '';
  }

  if (typeof date === 'string') {
    return date;
  }

  return date.isLuxonDateTime ? date.toISO() : date.toISOString();
}

/**
 * @param {Date|DateTime} startDate
 * @returns {string}
 */
export function getIso8601FormattedDateString(
  startDate,
  endDate,
  period,
  ends,
  times) {

  const isoStartDate = toIsoDateTimeString(startDate);
  const isoEndDate = toIsoDateTimeString(endDate);
  const numberOfRepetition = ends === 'after' ? times : '';
  const endOnDate = ends === 'ondate' ? isoEndDate : '';

  return `R${numberOfRepetition}/${isoStartDate}/${period}`
    + (endOnDate ? '/' + endOnDate : '');
}

export function getPeriod(repeat, periodicityValue) {
  return `P${repeat}${periodicityValue}`;
}
