import CycleManager from '@/components/inspectors/CycleManager';
import { DateTime } from 'luxon';

const startDate = DateTime.utc(2020, 2, 29, 14, 0);
let manager;

describe('CycleManager', () => {
  beforeEach(() => {
    const repeat = '1';
    const periodicity = 'W';
    const selectedWeekdays = [];

    manager = new CycleManager(
      startDate,
      repeat,
      periodicity,
      selectedWeekdays,
    );
  });

  it('accepts ISO Stringified dates', () => {
    const stringDate = DateTime.utc(2020, 2, 29, 14, 0).toString();
    manager.startDate = stringDate;

    const expected = `R/${stringDate}/P1W`;
    expect(manager.dateIntervalString()).toBe(expected);
  });

  it('accepts JS Dates', () => {
    const jsDate = new Date(2020, 1, 29, 14, 0);
    manager.startDate = jsDate;

    const expected = `R/${jsDate.toISOString()}/P1W`;
    expect(manager.dateIntervalString()).toBe(expected);
  });

  it('calculates the next weekday date correctly', () => {
    const startOnSaturday = DateTime.utc(2020, 2, 29, 14, 0);
    manager.startDate = startOnSaturday;

    const ISO_FRIDAY = 5;
    const firstFridayAfterStart = manager.getWeekDayDate(ISO_FRIDAY).toString();

    const expected = '2020-03-06T14:00:00.000Z';
    expect(firstFridayAfterStart).toBe(expected);
  });

  it('returns start date if the selected day is the same day', () => {
    const startOnSaturday = DateTime.utc(2020, 2, 29, 14, 0);
    manager.startDate = startOnSaturday;
    const ISO_SATURDAY = 6;
    expect(manager.getWeekDayDate(ISO_SATURDAY).toString()).toBe(startOnSaturday.toString());
  });

  it('returns the start date and selected week days correctly', () => {
    manager.selectedWeekdays = [3, 4, 5, 6];

    const expected = `${startDate}|R/2020-03-04T14:00:00.000Z/P1W|R/2020-03-05T14:00:00.000Z/P1W|R/2020-03-06T14:00:00.000Z/P1W|R/2020-02-29T14:00:00.000Z/P1W`;
    expect(manager.dateIntervalString()).toBe(expected);
  });

  it('returns only the start date if no selected week days', () => {
    const expected = `R/${startDate}/P1W`;

    expect(manager.dateIntervalString()).toBe(expected);
  });
});
