import { DateTime } from 'luxon';

export default class TimeManager {
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
    dateIntervals.push(this._startDate);

    this._selectedWeekdays.forEach(day => {
      const weekDayDate = this.getWeekDayDate(day);
      const isoDateString = this.getIso8601FormattedDateString(weekDayDate);
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

  getIso8601FormattedDateString(startDate) {
    const numberOfRepetition = this._ends === 'after' ? this._times : '';
    const endOnDate = this._ends === 'ondate' ? this._endDate : '';
    const period = this.getPeriod();

    return `R${ numberOfRepetition }/${ startDate }/${ period }` + (endOnDate ? '/' + endOnDate : '');
  }

  dateIntervalString() {
    if (this.isWeeklyPeriodSelected() && this._selectedWeekdays.length > 0) {
      return this.getFormattedDateWithWeekdayIntervals();
    }
    return this.getIso8601FormattedDateString(DateTime.fromISO(this._startDate, { zone: 'utc' }));
  }

  getPeriod() {
    return `P${ this._repeat }` + this._periodicityValue;
  }

  isWeeklyPeriodSelected() {
    return this._periodicityValue === 'W';
  }

  weekdayStyle(day) {
    const currentDay = DateTime.fromISO(this._startDate, { zone: 'utc' }).toLocal().weekday;

    return [
      day.selected ? 'badge-primary' : 'badge-light',
      { 'border border-primary': currentDay === day.day },
    ];
  }
}
