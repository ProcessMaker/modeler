<template>
  <div class="form-group">
    <label>{{ $t('Delay') }}</label>
    <pre>{{ value }}</pre>
    <div>
      <input
        type="number"
        min="1"
        :max="periodicity.max"
        class="form-control control repeat"
        :data-test="repeatInput"
        v-model="repeat"
      >
      <select v-model="periodicity" class="form-control control periodicity">
        <option v-for="period in periods" :key="period.name" :value="period">{{ $t(period.name) }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import last from 'lodash/last';

const periodNames = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  month: 'month',
};

export default {
  props: ['value', 'repeatInput'],
  data() {
    const periods = [
      { name: periodNames.minute, value: 'M', max: 60, isTime: true },
      { name: periodNames.hour, value: 'H', max: 24, isTime: true },
      { name: periodNames.day, value: 'D', max: 365 },
      { name: periodNames.month, value: 'M', max: 12 },
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
        this.repeat = parseInt(value[value.length - 2]);
      },
      immediate: true,
    },
    durationExpression(durationExpression) {
      this.$emit('input', durationExpression);
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
  },
};
</script>

<style scoped="scoped">
.control {
  vertical-align: middle;
  display: inline-block;
  height: 3em;
  font-size: 1em;
}
.repeat {
  width: 6em !important;
  text-align: right;
}
.periodicity {
  width: 6em;
}
</style>

