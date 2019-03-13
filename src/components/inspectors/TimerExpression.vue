<template>
  <div class="form-group">
    <label>Start Date</label>
    <div>
      <datepicker
        v-model="startDate"
        calendar-class="calendar" format="yyyy-MM-dd"
        input-class="form-control start-date"
        class="start-date-div"
        @selected="updateStartDate"
      />
      <select v-model="startTime" class="form-control control time" @change="update">
        <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
      </select>
    </div>

    <template v-if="hasRepeat">
      <label>{{ repeatLabel }}</label>
      <div>
        <input type="number" min="1" class="form-control control repeat" v-model="repeat" @change="update">
        <select v-model="periodicity" class="form-control control periodicity" @change="update">
          <option value="day">day</option>
          <option value="week">week</option>
          <option value="month">month</option>
          <option value="year">year</option>
        </select>
      </div>
    </template>

    <div v-if="periodicity==='week'">
      <label>{{ weekLabel }}</label>
      <div>
        <span
          v-for="(day, index) in weekdays"
          :key="index + 'week'"
          class="badge badge-pill weekday"
          :class="weekdayStyle(day)"
          :data-test="`day-${ index }`"
          @click="clickWeekDay(day);update()"
        >
          {{ day.initial }}
        </span>
      </div>
    </div>

    <template v-if="hasEnds">
      <label>Ends</label>
      <div>
        <div class="form-check">
          <label class="form-check-label">
            <input type="radio" class="form-check-input" name="optradio" value="never" v-model="ends" @change="update">Never
          </label>
        </div>
        <div class="form-check check-input">
          <label class="form-check-label">
            <input type="radio" class="form-check-input" name="optradio" value="ondate" v-model="ends" @change="update">On
          </label>
          <datepicker v-model="endDate" calendar-class="calendar" :disabled="ends!=='ondate'" format="yyyy-MM-dd"
            input-class="form-control end-date"
            class="control calendaron"
            :class="{'date-disabled' : ends!=='ondate'}"
            @selected="updateEndDate"
          />
        </div>
        <div class="form-check check-input">
          <label class="form-check-label">
            <input type="radio" class="form-check-input" name="optradio" value="after" v-model="ends" @change="update">After
          </label>
          <input v-model="times" type="number" min="0" :disabled="ends!=='after'" class="form-control control after" @change="update">
          <label class="occurrences">occurrences</label>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';

const periods = {
  'day': 'D',
  'week': 'W',
  'month': 'M',
  'year': 'Y',
};

export default {
  components: {
    Datepicker,
  },
  props: {
    value: Array,
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
    const date = moment().set('hour', 0).set('minutes', 0);
    const hours = [];
    for (let i = 0; i < 48; i++) {
      hours.push(date.format('HH:mm'));
      date.add(30, 'minutes');
    }
    return {
      today: moment().format('YYYY-MM-DD'),
      hours,
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
      startDate: new Date(),
      startTime: '00:00',
      repeat: '1',
      periodicity: 'week',
      ends: 'never',
      endDate: new Date(),
      times: '1',
    };
  },
  computed: {
    /**
     * ISO 8601 expression that represents the timer configuration
     */
    expression() {
      return this.makeTimerConfig();
    },
    /**
     * Array of week days the user selected
     */
    selectedWeekdays() {
      const selected = [];
      this.weekdays.forEach(weekday => {
        weekday.selected ? selected.push(weekday.day) : null;
      });
      return selected;
    },
    /**
     * True if the selected day is the same of the start date
     */
    sameDay() {
      return this.selectedWeekdays.length === 1 && this.weekdays[this.startDate.getDay()].selected;
    },
  },
  watch: {
    value: {
      handler(value) {
        return this.parseTimerConfig(value);
      },
      immediate: true,
    },
  },
  methods: {
    weekdayStyle(day) {
      return {
        'badge-primary': day.selected && !this.sameDay,
        'badge-light': !(day.selected && !this.sameDay),
        'border border-primary': this.startDate.getDay() === (day.day % 7),
      };
    },
    updateStartDate(date) {
      this.startDate = date;
      this.update();
    },
    updateEndDate(date) {
      this.endDate = date;
      this.update();
    },
    update() {
      this.$emit('input', this.expression);
    },
    parseDateExpression(exp) {
      const date = new Date(exp);
      if (isNaN(date.getTime())) {
        throw 'Invalid Date';
      }
      return moment(date);
    },
    /**
     * Parse an ISO8601 expression to get the timer configuration
     */
    parseTimerConfig(value) {
      this.resetTimerExpression();
      if (!value) {
        return;
      }
      try {
        let date, hasStartDate = false;
        const expression = value[0].timeCycle.body.split('|');
        expression.forEach(exp => {
          if (exp.substr(0, 1) !== 'R') {
            date = this.parseDateExpression(exp);
            this.startDate = date.toDate();
            this.startTime = date.format('HH:mm');
          } else {
            // ISO 8601 Repeating time intervals format
            // R[n?]/[start]/[period]/[end?]
            //   n: (optional) number of repetitions
            //   start: datetime when the cycle starts. Ex. 2018-10-02T15:00:00-04:00
            //   period: Or duration, intervening time between repetitions. Ex. P7D (7 days)
            //   end: (optional) datetime when the cycle ends. Ex. 2018-12-01T00:00:00-04:00
            //
            //  Ex. R5/2008-03-01T13:00:00Z/P2M
            let match = exp.match(/R(\d*)\/([^/]+)\/P(\d+)(\w)(?:\/([^/]+))?/);
            if (match) {
              this.times = match[1] || '1';
              date = this.parseDateExpression(match[2]);
              hasStartDate ? null : this.startDate = date.toDate();
              hasStartDate ? null : this.startTime = date.format('HH:mm');
              this.repeat = match[3];
              this.periodicity = Object.keys(periods).find(key => periods[key] === match[4]);
              this.endDate = match[5] ? this.parseDateExpression(match[5]).toDate() : new Date();
              this.ends = !match[5] ? !match[1] ? 'never' : 'after' : 'ondate';
              if (this.periodicity === 'week') {
                // Note this.weekday array must start with Sunday
                this.weekdays[date.get('day')].selected = true;
              }
            }
          }
          hasStartDate = true;
        });
      } catch (invalidExpression) {
        this.resetTimerExpression();
      }
    },
    resetTimerExpression() {
      this.startDate = new Date();
      this.startTime = '00:00';
      this.times = '1';
      this.repeat = '1';
      this.periodicity = 'week';
      this.endDate = new Date();
      this.ends = 'never';
      this.weekdays.forEach(weekday => weekday.selected = false);
    },
    clickWeekDay(weekday) {
      weekday.selected = !weekday.selected;
    },
    hasMultipleWeekdaySelected(){
      return this.periodicity === 'week'
        && this.selectedWeekdays.length > 0
        && !this.sameDay;
    },
    /**
     * Build a ISO8601 expression from the timer configuration
     */
    makeTimerConfig() {
      const expression = [];
      if (this.hasMultipleWeekdaySelected()) {
        expression.push(this.getDateTime(this.startDate, this.startTime));
        this.selectedWeekdays.forEach(day => {
          expression.push(this.getCycle(this.getWeekDayDate(this.startDate, day)));
        });
      } else {
        expression.push(this.getCycle(this.startDate));
      }
      return expression.join('|');
    },
    getCycle(startDate) {
      return this.makeCycle(
        (this.ends === 'after' ? this.times : ''),
        this.getDateTime(startDate, this.startTime),
        this.getPeriod(),
        (this.ends === 'ondate' ? this.getDateTime(this.endDate, this.startTime) : '')
      );
    },
    getWeekDayDate(date, isoWeekDay) {
      const day = isoWeekDay % 7;
      const mdate = moment(date);
      const current = mdate.get('day');
      return mdate.add((7 + day - current) % 7, 'day');
    },
    getDateTime(date, time) {
      const [hour, minutes] = time.split(':');
      return moment(date).set('hour', hour).set('minutes', minutes).format('YYYY-MM-DDTHH:mmZ');
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
  width: 6em;
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
</style>
