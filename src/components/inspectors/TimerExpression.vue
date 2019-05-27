<template>
  <div class="form-group">
    <form-date-picker
      :label="$t('Start date')"
      :placeholder="$t('Start date')"
      control-class="form-control"
      class="p-0"
      :format="DateTime.DATETIME_SHORT"
      :minuteStep="30"
      :phrases="{ ok: 'Save', cancel: 'Cancel' }"
      :value="startDate"
      @input="startDate = $event"
    />

    <template v-if="hasRepeat">
      <label class="">{{ $t(repeatLabel) }}</label>
      <b-form-group class="m-0 mb-3 p-0">
        <b-form-input type="number" min="1" class="d-inline-block w-50" v-model="repeat"/>
        <b-form-select v-model="periodicity" class="d-inline-block w-50 periodicity">
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
    </div>

    <template v-if="hasEnds">
      <label class="mt-1 ">{{ $t('Ends') }}</label>
      <div>
        <b-form-group class="m-0 mb-2">
          <b-form-radio v-model="ends" class="pl-3" name="optradio" value="never">{{ $t('Never') }}</b-form-radio>
        </b-form-group>

        <b-form-group class="p-0 mb-1" description="Please select date.">
          <b-form-radio v-model="ends" class="pl-3 ml-2 mb-1" name="optradio" value="ondate">{{ $t('On') }}</b-form-radio>
          <form-date-picker
            type="date"
            class="form-date-picker p-0 m-0"
            :class="{'date-disabled' : ends !== 'ondate'}"
            :disabled="ends !== 'ondate'"
            :placeholder="$t('End date')"
            control-class="form-control"
            :format="DateTime.DATE_SHORT"
            phrases='{ok: $t("Save"), cancel: $t("Cancel")}'
            :vaue="endDate"
            @input="endDate = $event"
          />
        </b-form-group>

        <b-form-group class="mt-0 p-0">
          <b-form-radio v-model="ends" class="pl-3 ml-2 mb-1" name="optradio" value="after">{{ $t('After') }}</b-form-radio>
          <b-form-input v-model="times" type="number" min="0" :disabled="ends !== 'after'" class="w-25 pl-2 pr-1 d-inline-block"/>
          <b-form-input :readonly="ends !== 'after'" v-model="occurrences" class=" w-75 d-inline-block occurrences-text" />
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
      occurrences: 'occurrences',
      data: { sampleDatePicker: DateTime.local().toISO() },
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
      startDate: DateTime.local().toISO(),
      repeat: '1',
      periodicity: 'week',
      ends: 'never',
      endDate: DateTime.local().toISO(),
      times: '1',
      yo: true,
    };
  },
  computed: {
    iso8606Expression() {
      const expression = [];

      if (this.hasMultipleWeekdaySelected()) {
        expression.push(this.startDate);

        this.selectedWeekdays.forEach(day => {
          expression.push(this.getCycle(this.getWeekDayDate(this.startDate, day)));
        });
      } else {
        expression.push(this.getCycle(this.startDate));
      }

      return expression.join('|');
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
      const currentWeekday = DateTime.fromISO(this.startDate).weekday;

      return this.selectedWeekdays.length === 1 &&
        this.weekdays.find(({ day }) => day === currentWeekday).selected;
    },
  },
  watch: {
    value: {
      handler(value) {
        this.parseTimerConfig(value);
      },
      immediate: true,
    },
    iso8606Expression() {
      this.update();
    },
  },
  methods: {
    weekdayStyle(day) {
      return {
        'badge-primary': day.selected && !this.sameDay,
        'badge-light': !(day.selected && !this.sameDay),
        'border border-primary': DateTime.fromISO(this.startDate).weekday === day.day,
      };
    },
    update() {
      this.$emit('input', this.iso8606Expression);
    },
    /**
     * Parse an ISO8601 expression to get the timer configuration
     */
    parseTimerConfig(value) {
      if (!value) {
        return;
      }

      try {
        let hasStartDate = false;
        const expression = value[0].timeCycle.body.split('|');

        expression.forEach(exp => {
          if (exp.substr(0, 1) !== 'R') {
            this.startDate = exp;
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
              hasStartDate ? null : this.startDate = match[2];

              this.repeat = match[3];
              this.periodicity = Object.keys(periods).find(key => periods[key] === match[4]);
              this.endDate = match[5] ? match[5] : DateTime.local().toISO();
              this.ends = !match[5]
                ? !match[1]
                  ? 'never'
                  : 'after'
                : 'ondate';

              if (this.periodicity === 'week') {
                // Note this.weekday array must start with Sunday
                const currentWeekday = DateTime.fromISO(this.startDate).weekday;
                this.weekdays.find(({ day }) => day === currentWeekday).selected = true;
                // this.weekdays[DateTime.fromISO(this.startDate).weekday - 1].selected = true;
              }
            }
          }

          hasStartDate = true;
        });
      } catch (error) {
        this.resetTimerExpression();
      }
    },
    resetTimerExpression() {
      this.startDate = DateTime.local().toISO();
      this.times = '1';
      this.repeat = '1';
      this.periodicity = 'week';
      this.endDate = DateTime.local();
      this.ends = 'never';
      this.weekdays.forEach(weekday => weekday.selected = false);
    },
    clickWeekDay(weekday) {
      weekday.selected = !weekday.selected;
    },
    hasMultipleWeekdaySelected(){
      return this.periodicity === 'week' &&
        this.selectedWeekdays.length > 0 &&
        !this.sameDay;
    },
    getCycle(startDate) {
      return this.makeCycle(
        (this.ends === 'after' ? this.times : ''),
        startDate,
        this.getPeriod(),
        (this.ends === 'ondate' ? this.endDate : '')
      );
    },
    getWeekDayDate(date, isoWeekDay) {
      const day = isoWeekDay % 7;
      const mdate = DateTime.fromISO(date);
      const current = mdate.weekday - 1;
      return mdate.plus({ days: (7 + day - current) % 7 });
    },
    getPeriod() {
      return `P${this.repeat}` + periods[this.periodicity];
    },
    makeCycle(times, datetime, period, end) {
      return `R${times}/${datetime}/${period}` + (end ? '/' + end : '');
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
  margin-top: -3px;
}
.weekday {
  padding: 1em;
  margin-left: 0.2em;
  margin-bottom: 0.5em;
  cursor: pointer;
}
.time {
  width: 5em;
  height: 38px;
  font-size: 16px;
}
.start-date-div {
  vertical-align: middle;
  display: inline-block;
}
.after {
  height: 38px;
  font-size: 16px;
  margin-left: 0.75rem;
}
.after:disabled {
  color: transparent;
}
.check-input {
  margin-top: 4px;
}
.form-check {
  display: flex;
  justify-content: space-between;
}
.check-input > .form-check-label {
  line-height: 3em;
}
.check-input .form-check-input {
  margin-top: 1em;
}
.occurrences {
  position: absolute;
  right: 1em;
  line-height: 3em;
}
.same-day {
  opacity: 0.7;
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
