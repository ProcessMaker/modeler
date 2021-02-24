<template>
  <div class="form-group">
    <form-date-picker
      :emit-iso="true"
      data-test="start-date-picker"
      data-format="datetime"
      :label="$t('Start date')"
      :placeholder="$t('Start date')"
      control-class="form-control"
      class="p-0"
      :value="startDate"
      @input="setStartDate"
      :helper="$t(startDateHelper)"
    />

    <template v-if="hasRepeat">
      <label class="">{{ $t(repeatLabel) }}</label>
      <b-form-group class="m-0 mb-3 p-0">
        <b-form-input type="number" min="1" max="99" class="d-inline-block w-50" v-model="repeat" data-test="repeat-input" />
        <b-form-select v-model="periodicity" class="d-inline-block w-50 periodicity" data-test="repeat-on-select">
          <option value="day">{{ $t('day') }}</option>
          <option value="week">{{ $t('week') }}</option>
          <option value="month">{{ $t('month') }}</option>
          <option value="year">{{ $t('year') }}</option>
        </b-form-select>
        <small class="form-text text-muted">{{ $t(repeatHelper) }}</small>
      </b-form-group>
    </template>

    <weekday-select
      v-if="isWeeklyPeriodSelected"
      v-model="expression"
      :selectWeekdays="selectedWeekdays"
      :periodicityValue="periodicityValue"
      :repeat="repeat"
      :start-date="startDate"
      :end-date="endDate"
      :ends="ends"
      :times="times"
    />

    <template v-if="hasEnds">
      <label class="mt-1 ">{{ $t('Ends') }}</label>
      <div>
        <b-form-group class="m-0 mb-2">
          <b-form-radio v-model="ends" data-test="ends-never" name="optradio" value="never">{{ $t('Never') }}</b-form-radio>
        </b-form-group>

        <b-form-group class="p-0 mb-1" :description="`${$t('Click On to select a date')}.`">
          <b-form-radio v-model="ends" class="pl-3 ml-2 mb-1" name="optradio" value="ondate" data-test="ends-on">{{ $t('On') }}</b-form-radio>
          <form-date-picker
            :emit-iso="true"
            data-test="end-date-picker"
            class="form-date-picker p-0 m-0"
            :class="{'date-disabled' : ends !== 'ondate'}"
            :disabled="ends !== 'ondate'"
            :placeholder="$t('End date')"
            data-format="datetime"
            control-class="form-control"
            :value="endDate"
            @input="setEndDate"
            name="end date"
          />
        </b-form-group>

        <b-form-group class="mt-0 p-0" :description="`${$t('Click After to enter how many occurrences to end the timer control')}.`">
          <b-form-radio v-model="ends" data-test="ends-after" class="pl-3 ml-2 mb-1" name="optradio" value="after">{{ $t('After') }}</b-form-radio>
          <b-form-input v-model="times" data-test="ends-after-input" type="number" min="0" max="99" :disabled="ends !== 'after'" class="w-25 pl-2 pr-1 d-inline-block" />
          <b-form-input :readonly="ends !== 'after'" :value="$t('occurrences')" class=" w-75 d-inline-block occurrences-text" />
        </b-form-group>
      </div>
    </template>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import WeekdaySelect from './WeekdaySelect';
import { getIso8601FormattedDateString, getPeriod } from './TimeUtils';

const periods = {
  day: 'D',
  week: 'W',
  month: 'M',
  year: 'Y',
};

export default {
  components: { WeekdaySelect },
  props: {
    value: [Array, String],
    hasEnds: {
      type: Boolean,
      default: true,
    },
    hasRepeat: {
      type: Boolean,
      default: true,
    },
    repeatLabel: {
      type: String,
      default: 'Repeat every',
    },
    weekLabel: {
      type: String,
      default: 'Repeat on',
    },
    startDateHelper: {
      type: String,
      default: 'Select the date to initially trigger this element',
    },
    repeatHelper: {
      type: String,
      default: 'Set the periodic interval to trigger this element again',
    },
    periodicityHelper: {
      type: String,
      default: 'Select the day(s) of the week in which to trigger this element',
    },
  },
  data() {
    return {
      DateTime,
      expression: null,
      startDate: DateTime.local().toUTC().toISO(),
      repeat: '1',
      periodicity: 'week',
      ends: 'never',
      endDate: DateTime.local().toUTC().toISO(),
      times: '1',
      selectedWeekdays: [],
    };
  },
  created() {
    this.parseTimerConfig(this.value);
  },
  watch: {
    timerExpression: {
      handler(timerExpression) {
        this.$emit('input', timerExpression);
      },
      immediate: true,
    },
  },
  computed: {
    periodicityValue() {
      return periods[this.periodicity];
    },
    timerExpression() {
      if (this.isWeeklyPeriodSelected() && this.expression) {
        return this.expression;
      }
      const period = getPeriod(this.repeat, this.periodicityValue);
      return getIso8601FormattedDateString(this.startDate, this.endDate, period, this.ends, this.times);
    },
  },
  methods: {
    isWeeklyPeriodSelected() {
      return this.periodicity === 'week';
    },
    setStartDate(startDateString) {
      this.startDate = DateTime
        .fromISO(startDateString, { zone: 'utc' })
        .set({
          seconds: 0,
          milliseconds: 0,
        })
        .toUTC()
        .toISO();
    },
    setEndDate(endDateString) {
      const startDate = DateTime.fromISO(this.startDate, { zone: 'utc' });
      this.endDate = DateTime
        .fromISO(endDateString, { zone: 'utc' })
        .set({
          hours: startDate.hour,
          minutes: startDate.minute,
          seconds: 0,
          milliseconds: 0,
        })
        .toUTC()
        .toISO();
    },
    /**
     * Parse an ISO8601 expression to get the timer configuration
     */
    parseTimerConfig(value) {
      if (!value[0].timeCycle.body) {
        return;
      }

      try {
        let hasStartDate = false;
        const expression = value[0].timeCycle.body.split('|');

        expression.forEach(exp => {
          if (exp.substr(0, 1) !== 'R') {
            this.startDate = exp;
            hasStartDate = true;
          } else {
            // ISO 8601 Repeating time intervals format
            // R[n?]/[start]/[period]/[end?]
            //   n: (optional) number of repetitions
            //   start: datetime when the cycle starts. Ex. 2018-10-02T15:00:00-04:00
            //   period: Or duration, intervening time between repetitions. Ex. P7D (7 days)
            //   end: (optional) datetime when the cycle ends. Ex. 2018-12-01T00:00:00-04:00
            //
            //  Ex. R5/2008-03-01T13:00:00Z/P2M
            const match = exp.match(/R(\d*)\/([^/]+)\/P(\d+)(\w)(?:\/([^/]+))?/);
            if (match) {
              this.times = match[1] || '1';
              this.repeat = match[3];
              this.periodicity = Object.keys(periods).find(key => periods[key] === match[4]);

              if (!hasStartDate) {
                this.startDate = match[2];
                hasStartDate = true;
              }

              if (this.isWeeklyPeriodSelected()) {
                const dayOfWeek = DateTime.fromISO(match[2], { zone: 'utc' }).toLocal().weekday;
                this.selectedWeekdays.push(dayOfWeek);
              }

              this.endDate = match[5] || DateTime.local().toUTC().toISO();
              this.ends = !match[5]
                ? !match[1]
                  ? 'never'
                  : 'after'
                : 'ondate';
            }
          }

          hasStartDate = true;
        });
      } catch (error) {
        this.resetTimerExpression();
      }
    },
    resetTimerExpression() {
      this.startDate = DateTime.local().toUTC().toISO();
      this.times = '1';
      this.repeat = '1';
      this.periodicity = 'week';
      this.endDate = DateTime.local().toUTC().toISO();
      this.ends = 'never';
      this.expression = null;
      this.selectedWeekdays = [];
    },
  },
};
</script>

<style scoped="scoped">
.periodicity {
  margin-top: -3px;
}
</style>

<style>

.form-date-picker label {
  display: none;
}

.occurrences-text {
  pointer-events: none;
}
</style>
