<template>
  <div class="mt-3">
    <label>{{ $t('Duration') }}</label>
    <b-input-group>
      <b-form-input
        type="number"
        min="1"
        class="form-control control repeat"
        :data-test="repeatInput"
        v-model="repeat"
      />

      <b-input-group-append>
        <b-form-select v-model="periodicity">
          <option v-for="period in periods" :key="period.name" :value="period">{{ $t(period.name) }}</option>
        </b-form-select>
      </b-input-group-append>
      <small class="form-text text-muted">{{ $t('Select the duration of the timer') }}</small>
    </b-input-group>
  </div>
</template>

<script>
import last from 'lodash/last';

const periodNames = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
};

export default {
  props: ['value', 'repeatInput'],
  data() {
    const periods = [
      { name: periodNames.minute, value: 'M', isTime: true },
      { name: periodNames.hour, value: 'H', isTime: true },
      { name: periodNames.day, value: 'D' },
      { name: periodNames.week, value: 'W' },
      { name: periodNames.month, value: 'M' },
    ];

    return {
      repeat: null,
      periodicity: null,
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
    durationExpression: {
      handler(durationExpression) {
        this.$emit('input', durationExpression);
      },
      immediate: true,
    },
  },
  computed: {
    durationExpression() {
      if (this.periodicity.isTime) {
        return `PT${this.repeat}${this.periodicity.value}`;
      }

      return `P${this.repeat}${this.periodicity.value}`;
    },
  },
  methods: {
    getPeriodFromDelayString(delayString) {
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
      return delayString[1] === 'T';
    },
    getRepeatNumberFromDelayString(delayString) {
      const match = delayString.match(/\d+/);
      return match && match[0];
    },
  },
};
</script>
