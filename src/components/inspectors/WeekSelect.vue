<template>
  <div v-if="isWeeklyPeriodSelected(periodicityValue)" class="pt-2 mb-2 form-group">
    <label class="">{{ $t(weekLabel) }}</label>
    <div>
      <span
        v-for="day in weekdays"
        :key="day.day"
        class="badge badge-pill weekday mb-1"
        :class="weekdayStyle(day, startDate)"
        :data-test="`day-${ day.day }`"
        @click="clickWeekDay(day)"
      >
        {{ $t(day.initial) }}
      </span>
    </div>
    <small v-if="repeatOnValidationError" class="text-danger">{{ repeatOnValidationError }}</small>
    <small class="form-text text-muted">{{ $t(periodicityHelper) }}</small>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import { dateIntervalString, isWeeklyPeriodSelected, weekdayStyle } from '@/components/inspectors/Time';

export default {
  props: {
    periodicityValue: {
      type: String,
      required: true,
    },
    repeat: {
      type: [String, Number],
      default: 1,
    },
    hasEnds: {
      type: Boolean,
      default: true,
    },
    weekLabel: {
      type: String,
      default: 'Repeat on',
    },
    periodicityHelper: {
      type: String,
      default: 'Select the day(s) of the week in which to trigger this element',
    },
  },
  data() {
    return {
      DateTime,
      weekdays: [
        //  ISO week date weekday number, from 1 through 7,
        //  beginning with Monday and ending with Sunday.
        {
          day: 7,
          initial: 'S',
          selected: false,
        },
        {
          day: 1,
          initial: 'M',
          selected: false,
        },
        {
          day: 2,
          initial: 'T',
          selected: false,
        },
        {
          day: 3,
          initial: 'W',
          selected: false,
        },
        {
          day: 4,
          initial: 'T',
          selected: false,
        },
        {
          day: 5,
          initial: 'F',
          selected: false,
        },
        {
          day: 6,
          initial: 'S',
          selected: false,
        },
      ],
      startDate: DateTime.local().toUTC().toISO(),
      endDate: null,
      ends: 'never',
      times: '1',
    };
  },
  watch: {
    dateIntervalString() {
      this.update();
    },
  },
  computed: {
    repeatOnValidationError() {
      const numberOfSelectedWeekdays = this.weekdays.filter(({ selected }) => selected).length;

      if (this.periodicityValue !== 'W' || numberOfSelectedWeekdays > 0) {
        return null;
      }

      return 'You must select at least one day.';
    },
    dateIntervalString() {
      return dateIntervalString(this.selectedWeekdays, this.startDate, this.repeat, this.periodicityValue);
    },
    selectedWeekdays() {
      return this.weekdays.filter(({ selected }) => selected).map(({ day }) => day);
    },
  },
  methods: {
    isWeeklyPeriodSelected,
    weekdayStyle,
    clickWeekDay(weekday) {
      weekday.selected = !weekday.selected;
    },
    update() {
      if (!this.isWeeklyPeriodSelected(this.periodicityValue)) {
        return;
      }
      // eslint-disable-next-line no-console
      console.log('emit', this.dateIntervalString);
      this.$emit('input', this.dateIntervalString);
    },

  },
};
</script>

<style scoped="scoped">
  .weekday {
    padding: 0.75em;
    margin-left: 0.2em;
    margin-bottom: 0.5em;
    cursor: pointer;
  }
</style>
