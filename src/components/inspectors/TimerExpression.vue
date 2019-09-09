<template>
  <div class="form-group">
    <form-date-picker
      data-test="start-date-picker"
      :label="$t('Start date')"
      :placeholder="$t('Start date')"
      control-class="form-control"
      class="p-0"
      :value="startDate"
      @input="setStartDate"
    />

    <template v-if="hasRepeat">
      <label class="">{{ $t(repeatLabel) }}</label>
      <b-form-group class="m-0 mb-3 p-0">
        <b-form-input type="number" min="1" max="99" class="d-inline-block w-50" v-model="repeat" data-test="repeat-input"/>
        <b-form-select v-model="periodicity" class="d-inline-block w-50 periodicity" data-test="repeat-on-select">
          <option value="day">{{ $t('day') }}</option>
          <option value="week">{{ $t('week') }}</option>
          <option value="month">{{ $t('month') }}</option>
          <option value="year">{{ $t('year') }}</option>
        </b-form-select>
      </b-form-group>
    </template>

    <div v-if="periodicity === 'week'" class="mb-2">
      <label class="">{{ $t(weekLabel) }}</label>
      <div>
        <span
          v-for="day in weekdays"
          :key="day.day"
          class="badge badge-pill weekday mb-1"
          :class="weekdayStyle(day)"
          :data-test="`day-${ day.day }`"
          @click="clickWeekDay(day)"
        >
          {{ $t(day.initial) }}
        </span>
      </div>
      <small v-if="repeatOnValidationError" class="text-danger">{{ repeatOnValidationError }}</small>
    </div>

    <template v-if="hasEnds">
      <label class="mt-1 ">{{ $t('Ends') }}</label>
      <div>
        <b-form-group class="m-0 mb-2">
          <b-form-radio v-model="ends" data-test="ends-never" class="pl-3" name="optradio" value="never">{{ $t('Never') }}</b-form-radio>
        </b-form-group>

        <b-form-group class="p-0 mb-1" :description="`${$t('Please click On to select a date')}.`">
          <b-form-radio v-model="ends" class="pl-3 ml-2 mb-1" name="optradio" value="ondate" data-test="ends-on">{{ $t('On') }}</b-form-radio>
          <form-date-picker
            data-test="end-date-picker"
            class="form-date-picker p-0 m-0"
            :class="{'date-disabled' : ends !== 'ondate'}"
            :disabled="ends !== 'ondate'"
            :placeholder="$t('End date')"
            control-class="form-control"
            :value="endDate"
            @input="setEndDate"
          />
        </b-form-group>

        <b-form-group class="mt-0 p-0">
          <b-form-radio v-model="ends" data-test="ends-after" class="pl-3 ml-2 mb-1" name="optradio" value="after">{{ $t('After') }}</b-form-radio>
          <b-form-input v-model="times" data-test="ends-after-input" type="number" min="0" max="99" :disabled="ends !== 'after'" class="w-25 pl-2 pr-1 d-inline-block"/>
          <b-form-input :readonly="ends !== 'after'" :value="$t('occurrences')" class=" w-75 d-inline-block occurrences-text" />
        </b-form-group>
      </div>
    </template>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

const periods = {
  day: 'D',
  week: 'W',
  month: 'M',
  year: 'Y',
};

export default {
  props: {
    value: [ Array, String ],
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
  },
  data() {
    return {
      DateTime,
      weekdays: [
        //  ISO week date weekday number, from 1 through 7,
        //  beginning with Monday and ending with Sunday.
        {
          day: 7,
          initial: 'S',
          selected: false,
        },
        {
          day: 1,
          initial: 'M',
          selected: false,
        },
        {
          day: 2,
          initial: 'T',
          selected: false,
        },
        {
          day: 3,
          initial: 'W',
          selected: false,
        },
        {
          day: 4,
          initial: 'T',
          selected: false,
        },
        {
          day: 5,
          initial: 'F',
          selected: false,
        },
        {
          day: 6,
          initial: 'S',
          selected: false,
        },
      ],
      startDate: DateTime.local().toUTC().toISO(),
      repeat: '1',
      periodicity: 'week',
      ends: 'never',
      endDate: DateTime.local().toUTC().toISO(),
      times: '1',
    };
  },
  computed: {
    isWeeklyPeriodSelected() {
      return this.periodicity === 'week';
    },
    repeatOnValidationError() {
      const numberOfSelectedWeekdays = this.weekdays.filter(({ selected }) => selected).length;
      
      if (this.periodicity !== 'week' || numberOfSelectedWeekdays > 0) {
        return null;
      }

      return 'You must select at least one day.';
    },
    dateIntervalString() {
      if (this.isWeeklyPeriodSelected) {
        return this.getFormattedDateWithWeekdayIntervals();
      }

      return this.getIso8601FormattedDateString(DateTime.fromISO(this.startDate, { zone: 'utc' }));
    },
    /**
     * Array of week days the user selected
     */
    selectedWeekdays() {
      return this.weekdays.filter(({ selected }) => selected)
        .map(({ day }) => day);
    },
    /**
     * True if the selected day is the same of the start date
     */
    sameDay() {
      const currentWeekday = DateTime.fromISO(this.startDate, { zone: 'utc' }).toLocal().weekday;
      return this.selectedWeekdays.length === 1 &&
        this.weekdays.find(({ day }) => day === currentWeekday).selected;
    },
  },
  watch: {
    dateIntervalString() {
      this.update();
    },
  },
  mounted() {
    this.parseTimerConfig(this.value);
  },
  methods: {
    getFormattedDateWithWeekdayIntervals() {
      const dateIntervals = [];
      dateIntervals.push(this.startDate);

      this.selectedWeekdays.forEach(day => {
        const weekDayDate = this.getWeekDayDate(day);
        const isoDateString = this.getIso8601FormattedDateString(weekDayDate);
        dateIntervals.push(isoDateString);
      });

      return dateIntervals.join('|');
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
    weekdayStyle(day) {
      const currentDay = DateTime.fromISO(this.startDate, { zone: 'utc' }).toLocal().weekday;

      return [
        day.selected ? 'badge-primary' : 'badge-light',
        { 'border border-primary': currentDay === day.day },
      ];
    },
    update() {
      this.$emit('input', this.dateIntervalString);
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

              if (this.isWeeklyPeriodSelected) {
                const dayOfWeek = DateTime.fromISO(match[2], { zone: 'utc' }).toLocal().weekday;
                const foundDay = this.weekdays.find(wd => wd.day === dayOfWeek);
                foundDay.selected = true;
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
      this.weekdays.forEach(weekday => weekday.selected = false);
    },
    clickWeekDay(weekday) {
      weekday.selected = !weekday.selected;
    },
    hasMultipleWeekdaySelected(){
      return this.isWeeklyPeriodSelected &&
        this.selectedWeekdays.length > 0 &&
        !this.sameDay;
    },
    getIso8601FormattedDateString(startDate) {
      const numberOfRepetition = this.ends === 'after' ? this.times : '';
      const period = this.getPeriod();
      const endDate = this.ends === 'ondate' ? this.endDate : '';

      return `R${numberOfRepetition}/${startDate}/${period}` + (endDate ? '/' + endDate : '');
    },
    getWeekDayDate(isoWeekDay) {
      const startDate = DateTime.fromISO(this.startDate, { zone: 'utc' });
      let weekDayDate = startDate.set({ weekday: isoWeekDay });

      if (weekDayDate.toMillis() < startDate.toMillis()) {
        weekDayDate = weekDayDate.plus({ days: 7 });
      }

      return weekDayDate.toUTC().toISO();
    },
    getPeriod() {
      return `P${this.repeat}` + periods[this.periodicity];
    },
  },
};
</script>

<style scoped="scoped">
.periodicity {
  margin-top: -3px;
}
.weekday {
  padding: 0.75em;
  margin-left: 0.2em;
  margin-bottom: 0.5em;
  cursor: pointer;
}
</style>

<style>
.calendar {
  width: 16em;
}

.calendaron {
  margin-left: 0.75rem;
}

.calendar .cell {
  height: 2em;
  line-height: 2em;
}

.start-date {
  background-color: white !important;
  width: 8em !important;
}

.end-date {
  background-color: white !important;
}

.date-disabled .end-date {
  background-color: #e9ecef !important;
  color: transparent;
}

.form-date-picker label {
  display: none;
}

.occurrences-text {
  pointer-events: none;
}
</style>
