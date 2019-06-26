<template>
  <div>
    <label>{{ $t('Type') }}</label>
    <b-input-group>
      <b-form-select :value="timerPropertyName" data-test="intermediateTypeSelect" @change="changeType">
        <option value="timeDuration">{{ $t('Delay') }}</option>
        <option value="timeDate">{{ $t('Date/Time') }}</option>
      </b-form-select>
    </b-input-group>

    <component :is="component" v-model="timerProperty" :has-ends="false" repeat-label="Wait for" week-label="Every"/>
  </div>
</template>

<script>
import DurationExpression from './DurationExpression';
import DateTimeExpression from './DateTimeExpression';

const types = {
  timeDuration: 'DurationExpression',
  timeDate : 'DateTimeExpression',
};

export default {
  props: ['options', 'value'],
  components: {
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
    changeType(value) {
      this.emitChange(value, this.timerProperty);
    },
    emitChange(type, body) {
      this.$emit('input', { type, body });
    },
  },
};
</script>
