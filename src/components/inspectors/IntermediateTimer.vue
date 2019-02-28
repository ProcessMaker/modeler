<template>
  <div>
    <div class="form-group">
      <label>Type</label>
      <select :value="timerPropertyName" data-test="intermediateTypeSelect" class="form-control" @change="changeType">
        <option value="timeDuration">Delay</option>
        <option value="timeDate">Date/Time</option>
      </select>
    </div>

    <component :is="component" v-model="timerProperty" :has-ends="false" repeat-label="Wait for" week-label="Every"/>
  </div>
</template>

<script>
import TimerExpression from './TimerExpression';
import DurationExpression from './DurationExpression';
import DateTimeExpression from './DateTimeExpression';

const types = {
  timeDuration: 'DurationExpression',
  timeCycle : 'TimerExpression',
  timeDate : 'DateTimeExpression',
};

export default {
  props: ['options', 'value'],
  components: {
    TimerExpression,
    DurationExpression,
    DateTimeExpression,
  },
  computed: {
    component() {
      return types[this.timerPropertyName];
    },
    timerProperty: {
      get() {
        return this.value.body;
      },
      set(timerProperty) {
        this.emitChange(this.value.type, timerProperty);
      },
    },
    timerPropertyName() {
      return this.value.type;
    },
  },
  methods: {
    changeType(event) {
      this.emitChange(event.target.value, this.timerProperty);
    },
    emitChange(type, body) {
      this.$emit('input', { type, body });
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
