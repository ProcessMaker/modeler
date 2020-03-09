<template>
  <div v-if="cycleManager.isWeeklyPeriodSelected()" class="mb-2">
    <label class="">{{ $t(weekLabel) }}</label>
    <div>
      <span
        v-for="day in weekdays"
        :key="day.day"
        class="badge badge-pill weekday mb-1"
        :class="cycleManager.weekdayStyle(day)"
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
import CycleManager from '@/components/inspectors/CycleManager';

export default {
  props: {
    selectWeekdays: {
      type: Array,
      default: () => [],
    },
    startDate: {
      type: String,
      default: DateTime.local().toUTC().toISO(),
    },
    endDate: {
      type: String,
      default: null,
    },
    ends: {
      type: String,
      default: 'never',
    },
    times: {
      type: [Number, String],
      default: 1,
    },
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
      cycleManager: new CycleManager(this.startDate, this.repeat, this.periodicityValue, this.selectedWeekdays, this.endDate, this.ends, this.times),
    };
  },
  watch: {
    startDate(value) {
      this.cycleManager.startDate = value;
    },
    endDate(value) {
      this.cycleManager.endDate = value;
    },
    ends(value) {
      this.cycleManager.ends = value;
    },
    times(value) {
      this.cycleManager.times = value;
    },
    repeat(value) {
      this.cycleManager.repeat = value;
    },
    periodicityValue(value) {
      this.cycleManager.periodicityValue = value;
    },
    selectedWeekdays(value) {
      this.cycleManager.selectedWeekdays = value;
    },
    dateIntervalString() {
      this.update();
    },
  },
  mounted() {
    this.selectWeekdays.forEach(dayOfWeek => {
      const foundDay = this.weekdays.find(wd => wd.day === dayOfWeek);
      if (foundDay) {
        foundDay.selected = true;
      }
    });
  },
  computed: {
    repeatOnValidationError() {
      const numberOfSelectedWeekdays = this.weekdays.filter(({ selected }) => selected).length;

      if (!this.cycleManager.isWeeklyPeriodSelected() || numberOfSelectedWeekdays > 0) {
        return null;
      }

      return 'You must select at least one day.';
    },
    dateIntervalString() {
      return this.cycleManager.dateIntervalString();
    },
    selectedWeekdays() {
      return this.weekdays.filter(({ selected }) => selected).map(({ day }) => day);
    },
  },
  methods: {
    clickWeekDay(weekday) {
      weekday.selected = !weekday.selected;
    },
    update() {
      this.$emit('input', this.dateIntervalString);
    },
  },
  destroyed() {
    this.$emit('input', null);
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
