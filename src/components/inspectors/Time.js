import { DateTime } from 'luxon';

function getFormattedDateWithWeekdayIntervals(selectedWeekdays, startDate, period, endDate, ends, times) {
  const dateIntervals = [];
  dateIntervals.push(startDate);

  selectedWeekdays.forEach(day => {
    const weekDayDate = getWeekDayDate(day, startDate);
    const isoDateString = getIso8601FormattedDateString(weekDayDate, period, endDate, ends, times);
    dateIntervals.push(isoDateString);
  });

  return dateIntervals.join('|');
}

function getWeekDayDate(isoWeekDay, startDate) {
  const date = DateTime.fromISO(startDate, { zone: 'utc' });
  let weekDayDate = date.set({ weekday: isoWeekDay });

  if (weekDayDate.toMillis() < date.toMillis()) {
    weekDayDate = weekDayDate.plus({ days: 7 });
  }

  return weekDayDate.toUTC().toISO();
}

function getIso8601FormattedDateString(startDate, period, endDate, ends, times) {
  const numberOfRepetition = ends === 'after' ? times : '';
  const endOnDate = ends === 'ondate' ? endDate : '';
  // eslint-disable-next-line no-console
  console.log('format', `R${ numberOfRepetition }/${ startDate }/${ period }` + (endOnDate ? '/' + endOnDate : ''));

  return `R${ numberOfRepetition }/${ startDate }/${ period }` + (endOnDate ? '/' + endOnDate : '');
}

function getPeriod(repeat, periodicityValue) {
  return `P${ repeat }` + periodicityValue;
}

export function weekdayStyle(day, startDate) {
  const currentDay = DateTime.fromISO(startDate, { zone: 'utc' }).toLocal().weekday;

  return [
    day.selected ? 'badge-primary' : 'badge-light',
    { 'border border-primary': currentDay === day.day },
  ];
}

export function dateIntervalString(selectedWeekdays, startDate, repeat, periodicityValue, endDate = null, ends = 'never', times = '1') {
  const period = getPeriod(repeat, periodicityValue);

  if (isWeeklyPeriodSelected(periodicityValue) && selectedWeekdays.length > 0) {
    return getFormattedDateWithWeekdayIntervals(selectedWeekdays, startDate, period, endDate, ends, times);
  }
  return getIso8601FormattedDateString(
    DateTime.fromISO(startDate, { zone: 'utc' }),
    period,
    endDate,
    ends,
    times
  );
}

export function isWeeklyPeriodSelected(periodicityValue) {
  return periodicityValue === 'W';
}
