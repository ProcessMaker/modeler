<template>
  <div>
    <label>{{ $t('Type') }}</label>
    <b-input-group>
      <b-form-select :value="timerPropertyName" data-test="intermediateTypeSelect" @change="changeType">
        <option value="timeDuration">{{ $t('Duration') }}</option>
        <option value="timeDate">{{ $t('Date/Time') }}</option>
        <option value="timeCycle">{{ $t('Cycle') }}</option>
      </b-form-select>
    </b-input-group>

    <small class="form-text text-muted">{{ $t(typeHelper) }}</small>
    {{ value }}
    <div v-if="timerPropertyName === 'timeDate'" class="mt-2">
      <b-form-checkbox @change="toggleDynamicExpression" v-model="useDynamicExpression" switch data-test="dynamicExpressionToggle">
        {{ $t('Use dynamic expression') }}
      </b-form-checkbox>
    </div>
    
    <div v-if="timerPropertyName === 'timeDate' && useDynamicExpression" class="mt-2" data-test="dynamicExpressionContainer">
      <label for="feelExpression">{{ $t('FEEL expression') }}</label>
      <b-form-input
        v-model="feelExpression"
        placeholder=""
        @input="updateFeelExpression"
        data-test="feelExpressionInput"
      />

      <div class="mt-1 d-flex align-items-center">
        <small class="text-muted">
          {{ $t('Enter a FEEL expression') }}
          <a 
            :href="refLink" 
            target="_blank" 
            rel="noopener noreferrer"
            data-test="feelDocLink"
          >
            <i class="far fa-question-circle mr-1" data-test="feelHelpIcon"/>
          </a>
        </small>
      </div>
    </div>
    
    <component  
      v-if="!(timerPropertyName === 'timeDate' && useDynamicExpression)" 
      :is="component" 
      v-model="timerProperty" 
      :has-ends="false" 
      repeat-label="Wait for" 
      week-label="Every" 
      data-test="standardTimerInput"
    />
  </div>
</template>

<script>
import DurationExpression from './DurationExpression';
import DateTimeExpression from './DateTimeExpression';
import CycleExpression from './CycleExpression';
import { DateTime } from 'luxon';
import { defaultDurationTimerEvent } from '@/constants';

const types = {
  timeDuration: 'DurationExpression',
  timeDate: 'DateTimeExpression',
  timeCycle: 'CycleExpression',
};

export default {
  props: {
    value: {
      type: Object,
    },
    typeHelper: {
      type: String,
      default: 'Select the type of delay',
    },
  },
  components: {
    DurationExpression,
    DateTimeExpression,
    CycleExpression,
  },
  data() {
    return {
      feelExpression: '',
      refLink: 'https://docs.processmaker.com/docs/feel-expression-syntax',
    };
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
    useDynamicExpression: {
      get() {
        return this.value.isFormalExpression;
      },
      set(useDynamicExpression) {
        console.log('useDynamicExpression', useDynamicExpression);
        this.emitChange(this.value.type, this.value.body, useDynamicExpression);
      },
    },
  },
  methods: {
    isISO8601DateString(expression) {
      console.log('isValidExpression', expression);
      if (!expression || typeof expression !== 'string') {
        return false;
      }
      // ISO date strings like "2025-05-01T04:00:00.000Z" are valid syntax for FEEL
      // but should be treated as literal strings, not expressions
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(expression);
    },
    toggleDynamicExpression(value) {
      console.log('toggleDynamicExpression', value, this.useDynamicExpression);
      if (!this.useDynamicExpression) {
        // If dynamic expression is turned off, set default datetime
        const defaultDatetime = DateTime.local().toUTC().toISO();
        this.emitChange(this.timerPropertyName, defaultDatetime, this.useDynamicExpression);
      } else {
        // If dynamic expression is turned on, clear the value
        this.feelExpression = '';
        this.emitChange(this.timerPropertyName, this.feelExpression, this.useDynamicExpression);
      }
    },
    changeType(type) {
      const defaultValue = (this.isDelayType(type) || this.isCycleType(type))
        ? defaultDurationTimerEvent
        : DateTime
          .local()
          .toUTC()
          .toISO();
      if (type !== 'timeDate') {
        // this.useDynamicExpression = false;
        this.feelExpression = '';
      }
      this.emitChange(type, defaultValue, this.useDynamicExpression);
    },
    isDelayType(type) {
      return types[type] === types.timeDuration;
    },
    isCycleType(type) {
      return types[type] === types.timeCycle;
    },
    emitChange(type, body, isFormalExpression) {
      this.$emit('input', { type, body, isFormalExpression });
    },
    updateFeelExpression(value) {
      this.feelExpression = value;
      this.emitChange(this.timerPropertyName, value, this.useDynamicExpression);
    },
  },
};
</script>
