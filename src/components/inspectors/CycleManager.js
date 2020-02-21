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
    this._startDate = startDate;
    this._repeat = repeat;
    this._periodicityValue = periodicityValue;
    this._selectedWeekdays = selectedWeekdays;
    this._endDate = endDate;
    this._ends = ends;
    this._times = times;
  }

  set startDate(value) {
    this._startDate = value;
  }

  set endDate(value) {
    this._endDate = value;
  }

  set ends(value) {
    this._ends = value;
  }

  set times(value) {
    this._times = value;
  }

  set repeat(value) {
    this._repeat = value;
  }

  set periodicityValue(value) {
    this._periodicityValue = value;
  }

  set selectedWeekdays(value) {
    this._selectedWeekdays = value;
  }

  getFormattedDateWithWeekdayIntervals() {
    const dateIntervals = [];
    const period = getPeriod(this._repeat, this._periodicityValue);

    dateIntervals.push(this._startDate);

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

    return weekDayDate.toUTC().toISO();
  }

  dateIntervalString() {
    if (this.isWeeklyPeriodSelected() && this.hasSelectedWeekdays()) {
      return this.getFormattedDateWithWeekdayIntervals();
    }
    const period = getPeriod(this._repeat, this._periodicityValue);
    return getIso8601FormattedDateString(DateTime.fromISO(this._startDate, { zone: 'utc' }), this._endDate, period, this._ends, this._times);
  }

  isWeeklyPeriodSelected() {
    return this._periodicityValue === 'W';
  }

  hasSelectedWeekdays() {
    return this._selectedWeekdays.length > 0;
  }

  weekdayStyle(day) {
    const currentDay = DateTime.fromISO(this._startDate, { zone: 'utc' }).toLocal().weekday;

    return [
      day.selected ? 'badge-primary' : 'badge-light',
      { 'border border-primary': currentDay === day.day },
    ];
  }
}
