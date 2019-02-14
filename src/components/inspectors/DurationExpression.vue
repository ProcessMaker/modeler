<template>
  <div class="form-group">
    <label>Delay</label>
    <div>
      <input type="number" min="1" class="form-control control repeat" v-model="repeat" @change="update">
      <select v-model="periodicity" class="form-control control periodicity" @change="update">
        <option value="day">day</option>
        <option value="week">week</option>
        <option value="month">month</option>
        <option value="year">year</option>
      </select>
    </div>
  </div>
</template>

<script>
import TimerExpression from './TimerExpression';

const periods = {
  'day': 'D',
  'week': 'W',
  'month': 'M',
  'year': 'Y',
};

export default {
  extends: TimerExpression,
  props: {
    value: String,
  },
  methods: {
    parseTimerConfig(value) {
      this.resetTimerExpression();
      if (!value) {
        return;
      }
      let match = value.match(/^P(\d+)(\w)$/);
      if (match) {
        this.periodicity = Object.keys(periods).find(key => periods[key] === match[2]);
        this.repeat = match[1];
      }
    },
    makeTimerConfig() {
      return this.getPeriod();
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
      width: 6em!important;
      text-align: right;
  }
  .periodicity {
      width: 6em;
  }
</style>
