<template>
  <div class="mt-3">
    <label>{{ $t('Recurring loop repeats at time interval set below') }}</label>
    <b-input-group>
      <b-form-input
        type="number"
        min="1"
        class="form-control control repeat"
        :data-test="repeatInput"
        v-model="repeat"
      />

      <b-input-group-append>
        <b-form-select v-model="periodicity" data-test="periods">
          <option v-for="period in periods" :key="period.name" :value="period">{{ $t(period.name) }}</option>
        </b-form-select>
      </b-input-group-append>

    </b-input-group>
    <b-input-group v-if="periodicity">
      <week-select v-model="weeks" :periodicityValue="periodicity.value" :repeat="repeat" />
    </b-input-group>
  </div>
</template>

<script>
import last from 'lodash/last';
import WeekSelect from './WeekSelect';

const periodNames = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
};

export default {
  components: { WeekSelect },
  props: ['value', 'repeatInput'],
  data() {
    const periods = [
      { name: periodNames.minute, value: 'M', isTime: true },
      { name: periodNames.hour, value: 'H', isTime: true },
      { name: periodNames.day, value: 'D' },
      { name: periodNames.week, value: 'W', isWeek: true },
      { name: periodNames.month, value: 'M' },
    ];

    return {
      repeat: null,
      periodicity: null,
      weeks: null,
      periods,
    };
  },
  watch: {
    value: {
      handler(value) {
        this.periodicity = this.getPeriodFromDelayString(value);
        this.repeat = this.getRepeatNumberFromDelayString(value);
      },
      immediate: true,
    },
    cycleExpression: {
      handler(cycleExpression) {
        this.$emit('input', cycleExpression);
      },
      immediate: true,
    },
  },
  computed: {
    cycleExpression() {
      if (this.periodicity.isTime) {
        return `R/PT${this.repeat}${this.periodicity.value}`;
      }
      if (this.periodicity.isWeek && this.weeks) {
        return this.weeks;
      }
      return `R/P${this.repeat}${this.periodicity.value}`;
    },
  },
  methods: {
    getPeriodFromDelayString(delayString) {
      // eslint-disable-next-line no-console
      console.log(delayString);
      const isTimePeriod = this.isTimePeriod(delayString);
      const periodicity = last(delayString);

      if (periodicity === 'M') {
        const periodName = isTimePeriod
          ? periodNames.minute
          : periodNames.month;

        return this.periods.find(({ name }) => name === periodName);
      }

      return this.periods.find(({ value }) => value === periodicity);
    },
    isTimePeriod(delayString) {
      return delayString[3] === 'T';
    },
    getRepeatNumberFromDelayString(delayString) {
      const match = delayString.match(/PT?(\d+)/);
      // eslint-disable-next-line no-console
      console.log('delayString', delayString);
      return match ? match[1] : 1;
    },
  },
};
</script>
