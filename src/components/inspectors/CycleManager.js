import { DateTime } from 'luxon';
import { getIso8601FormattedDateString, getPeriod } from './TimeUtils';

export default class CycleManager {
  #startDate;
  #repeat;
  #periodicityValue;
  _selectedWeekdays;
  _endDate;
  #ends;
  #times;

  constructor(startDate, repeat, periodicityValue, selectedWeekdays = [], endDate = null, ends = 'never', times = '1') {
    this.#startDate = this.sanitizeDate(startDate);
    this.#repeat = repeat;
    this.#periodicityValue = periodicityValue;
    this._selectedWeekdays = selectedWeekdays;
    this._endDate = this.sanitizeDate(endDate);
    this.#ends = ends;
    this.#times = times;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set startDate(value) {
    this.#startDate = this.sanitizeDate(value);
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set endDate(value) {
    this._endDate = this.sanitizeDate(value);
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set ends(value) {
    this.#ends = value;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set times(value) {
    this.#times = value;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set repeat(value) {
    this.#repeat = value;
  }

  // no coverage needed for mutator
  // istanbul ignore next
  set periodicityValue(value) {
    this.#periodicityValue = value;
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
    const period = getPeriod(this.#repeat, this.#periodicityValue);
    const dateIntervals = [this.#startDate.toISO()];

    this._selectedWeekdays.forEach(day => {
      const weekDayDate = this.getWeekDayDate(day);
      const isoDateString = getIso8601FormattedDateString(weekDayDate, this._endDate, period, this.#ends, this.#times);
      dateIntervals.push(isoDateString);
    });

    return dateIntervals.join('|');
  }

  getWeekDayDate(isoWeekDay) {
    const date = DateTime.fromISO(this.#startDate, { zone: 'utc' });
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
    const period = getPeriod(this.#repeat, this.#periodicityValue);
    return getIso8601FormattedDateString(this.#startDate, this._endDate, period, this.#ends, this.#times);
  }

  isWeeklyPeriodSelected() {
    return this.#periodicityValue === 'W';
  }

  hasSelectedWeekdays() {
    return this._selectedWeekdays.length > 0;
  }

  // Not calculating coverage for the untested FE logic here - this is
  // covered in e2e cypress tests
  // istanbul ignore next
  weekdayStyle(day) {
    const isoWeekDayNumber = this.#startDate.toLocal().weekday;

    return [
      day.selected ? 'badge-primary' : 'badge-light',
      { 'border border-primary': isoWeekDayNumber === day.day },
    ];
  }
}
