import { DateTime } from 'luxon';
import { getIso8601FormattedDateString, getPeriod } from './TimeUtils';

export default class CycleManager {
  _startDate;
  _repeat;
  _periodicityValue;
  _selectedWeekdays;
  _endDate;
  _ends;
  _times;

  constructor(startDate, repeat, periodicityValue, selectedWeekdays = [], endDate = null, ends = 'never', times = '1') {
    this._startDate = this.sanitizeDate(startDate);
    this._repeat = repeat;
    this._periodicityValue = periodicityValue;
    this._selectedWeekdays = selectedWeekdays;
    this._endDate = this.sanitizeDate(endDate);
    this._ends = ends;
    this._times = times;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set startDate(value) {
    this._startDate = this.sanitizeDate(value);
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set endDate(value) {
    this._endDate = this.sanitizeDate(value);
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set ends(value) {
    this._ends = value;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set times(value) {
    this._times = value;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set repeat(value) {
    this._repeat = value;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set periodicityValue(value) {
    this._periodicityValue = value;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set selectedWeekdays(value) {
    this._selectedWeekdays = value;
  }

  /**
   * For historic reasons we need to be liberal in how we accept various incoming
   * dates. See https://en.wikipedia.org/wiki/Robustness_principle
   *
   * Turns a date string, DateTime, or Date into a Luxon UTC DateTime or null
   * @param {Date|DateTime|string} date
   * @return {DateTime|null}
   */
  sanitizeDate(date) {
    if (date === null) {
      return date;
    }

    if (typeof date === 'string') {
      return DateTime.fromISO(date).toUTC();
    }

    return date.isLuxonDateTime ? date.toUTC() : DateTime.fromJSDate(date).toUTC();
  }

  getFormattedDateWithWeekdayIntervals() {
    const period = getPeriod(this._repeat, this._periodicityValue);
    const dateIntervals = [this._startDate.toISO()];

    this._selectedWeekdays.forEach(day => {
      const weekDayDate = this.getWeekDayDate(day);
      const isoDateString = getIso8601FormattedDateString(weekDayDate, this._endDate, period, this._ends, this._times);
      dateIntervals.push(isoDateString);
    });

    return dateIntervals.join('|');
  }

  getWeekDayDate(isoWeekDay) {
    const date = DateTime.fromISO(this._startDate, { zone: 'utc' });
    let weekDayDate = date.set({ weekday: isoWeekDay });

    if (weekDayDate.toMillis() < date.toMillis()) {
      weekDayDate = weekDayDate.plus({ days: 7 });
    }

    return weekDayDate.toUTC();
  }

  dateIntervalString() {
    if (this.isWeeklyPeriodSelected() && this.hasSelectedWeekdays()) {
      return this.getFormattedDateWithWeekdayIntervals();
    }
    const period = getPeriod(this._repeat, this._periodicityValue);
    return getIso8601FormattedDateString(this._startDate, this._endDate, period, this._ends, this._times);
  }

  isWeeklyPeriodSelected() {
    return this._periodicityValue === 'W';
  }

  hasSelectedWeekdays() {
    return this._selectedWeekdays.length > 0;
  }

  // Not calculating coverage for the untested FE logic here - this is
  // covered in e2e cypress tests
  // istanbul ignore next
  weekdayStyle(day) {
    const isoWeekDayNumber = this._startDate.toLocal().weekday;

    return [
      day.selected ? 'badge-primary' : 'badge-light',
      { 'border border-primary': isoWeekDayNumber === day.day },
    ];
  }
}
