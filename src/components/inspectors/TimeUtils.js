export function getIso8601FormattedDateString(startDate, endDate, period, ends, times) {
  const numberOfRepetition = ends === 'after' ? times : '';
  const endOnDate = ends === 'ondate' ? endDate : '';

  return `R${ numberOfRepetition }/${ startDate }/${ period }` + (endOnDate ? '/' + endOnDate : '');
}

export function getPeriod(repeat, periodicityValue) {
  return `P${ repeat }` + periodicityValue;
}
