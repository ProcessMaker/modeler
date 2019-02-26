<template>
  <div>
    <div class="form-group">
      <label>Type</label>
      <select :value="timerPropertyName" data-test="intermediateTypeSelect" class="form-control" @change="changeType">
        <option value="timeDuration">Delay</option>
        <option value="timeDate">Date/Time</option>
      </select>
    </div>
    <component :is="component" v-model="timerProperty.body" :has-ends="false" repeat-label="Wait for" week-label="Every"/>
  </div>
</template>

<script>
import TimerExpression from './TimerExpression';
import DurationExpression from './DurationExpression';
import DateTimeExpression from './DateTimeExpression';

export default {
  components: {
    TimerExpression,
    DurationExpression,
    DateTimeExpression,
  },
  computed: {
    component() {
      const types = {
        'timeDuration': 'DurationExpression',
        'timeCycle' : 'TimerExpression',
        'timeDate' : 'DateTimeExpression',
      };
      return types[this.timerPropertyName];
    },
    timerProperty() {
      return this.value[this.timerPropertyName];
    },
    timerPropertyName() {
      return Object.keys(this.value)[1];
    },
  },
  props: {
    value: Object,
  },
  methods: {
    changeType(event) {
      const value = this.timerProperty;
      const currentType = this.timerPropertyName;
      delete this.value[currentType];
      this.$set(this.value, event.target.value, value);
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
