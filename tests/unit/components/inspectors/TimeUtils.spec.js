import { getIso8601FormattedDateString, getPeriod } from '@/components/inspectors/TimeUtils';
import { DateTime } from 'luxon';

describe('TimeUtils', () => {
  describe('Iso8601 Formatted Cycle Strings', () => {
    const startDate = DateTime.utc(2020, 2, 29, 14, 0);
    const repeat = '1';
    const periodicity = 'W';
    const period = getPeriod(repeat, periodicity);

    it('it formats weekly cycle that repeats indefinitely correctly', () => {
      const ends = 'never';

      const expected = 'R/2020-02-29T14:00:00.000Z/P1W';

      expect(getIso8601FormattedDateString(
        startDate,
        null,
        period,
        ends,
        null)).toBe(expected);
    });

    it('it formats weekly cycle that ends after 10 weeks correctly', () => {
      const ends = 'after';
      const times = 10;

      const expected = 'R10/2020-02-29T14:00:00.000Z/P1W';

      expect(getIso8601FormattedDateString(
        startDate,
        null,
        period,
        ends,
        times)).toBe(expected);
    });

    it('it formats weekly cycle that ends a specific date correctly', () => {
      const endDate = DateTime.utc(2025, 3, 1, 14, 0).toJSDate();
      const ends = 'ondate';

      const expected = 'R/2020-02-29T14:00:00.000Z/P1W/2025-03-01T14:00:00.000Z';

      expect(getIso8601FormattedDateString(
        startDate,
        endDate,
        period,
        ends,
        null)).toBe(expected);
    });
  });

  describe('getPeriod', () => {
    it('can get a period from repeat and periodicity', () => {
      const repeat = '1';
      const periodicity = 'W';

      expect(getPeriod(repeat, periodicity)).toBe('P1W');
    });
  });
});
