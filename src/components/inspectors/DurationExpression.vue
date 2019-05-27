<template>
  <div class="form-group">
    <label>{{ $t('Delay') }}</label>
    <pre>{{ value }}</pre>
    <div>
      <input type="number" min="1" class="form-control control repeat" :data-test="repeatInput" v-model="repeat">
      <select v-model="periodicity" class="form-control control periodicity">
        <option v-for="(value, name) in periods" :key="name" :value="name">{{ $t(name) }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import last from 'lodash/last';

export default {
  props: ['value', 'repeatInput'],
  data() {
    const periods = {
      minute: 'M',
      hour: 'H',
      day: 'D',
      month: 'M',
    };

    return {
      repeat: null,
      periodicity: Object.keys(periods)[0],
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
      const periodicityString = this.periods[this.periodicity];

      if (this.isTimePeriod(this.periodicity)) {
        return `PT${this.repeat}${periodicityString}`;
      }

      return `P${this.repeat}${periodicityString}`;
    },
  },
  methods: {
    isTimePeriod(periodicity) {
      return ['minute', 'hour'].includes(periodicity);
    },
    getPeriodFromDelayString(delayString) {
      const isTimePeriod = this.isTimePeriodString(delayString);
      const periodicity = last(delayString);

      if (periodicity === 'M') {
        return isTimePeriod ? 'minute' : 'month';
      }

      return Object.keys(this.periods).find(period => this.periods[period] === periodicity);
    },
    isTimePeriodString(delayString) {
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

