<template>
  <div class="form-group">
    <label>Start Date</label>
    <div>
      <datepicker v-model="startDate" :placeholder="today"
                  calendar-class="calendar" format="yyyy-MM-dd"
                  input-class="form-control start-date" 
                  class="start-date-div"></datepicker>
      <select v-model="startTime" class="form-control control time">
        <option v-for="hour in hours" :key="hour" :value="hour">{{hour}}</option>
      </select>
    </div>
    <label>Repeat every</label>
    <div>
      <input type="number" min="1" class="form-control control repeat">
      <select v-model="periodicity" class="form-control control periodicity">
        <option value="day">day</option>
        <option value="week">week</option>
        <option value="month">month</option>
        <option value="year">year</option>
      </select>
    </div>
    <div v-if="periodicity==='week'">
      <label>Repeat on</label>
      <div>
        <span v-for="(day, index) in weekdays" :key="index" 
              class="badge badge-pill weekday"
              :class="{'badge-primary': day.selected, 'badge-light': !day.selected}"
              @click="clickWeekDay(day)">{{day.initial}}</span>
      </div>
    </div>
    <label>Ends</label>
    <table width="100%">
      <tr>
      </tr>
    </table>
    <div>
      <div class="form-check">
        <label class="form-check-label">
          <input type="radio" class="form-check-input" name="optradio" value="never" v-model="ends">Never
        </label>
      </div>
      <div class="form-check check-input">
        <label class="form-check-label">
          <input type="radio" class="form-check-input" name="optradio" value="ondate" v-model="ends">On &nbsp;
        </label>
        <datepicker v-model="endDate" calendar-class="calendar calendaron" :disabled="ends!=='ondate'" format="yyyy-MM-dd"
                    input-class="form-control end-date"
                    class=" control float-right"
                    :class="{'date-disabled' : ends!=='ondate'}"></datepicker>
      </div>
      <div class="form-check check-input">
        <label class="form-check-label">
          <input type="radio" class="form-check-input" name="optradio" value="after" v-model="ends">After &nbsp;
        </label>
        <input v-model="times" type="number" min="0" :disabled="ends!=='after'" 
               class="form-control control after float-right">
        <label class="occurrences">occurrences</label>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';

export default {
  components: {
    Datepicker,
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
      endDate: '',
      times: '',
    };
  },
  computed: {
    expression() {
      return this.makeTimerConfig();
    },
    selectedWeekdays() {
      const selected = [];
      this.weekdays.forEach(weekday => {
        weekday.selected ? selected.push(weekday.day) : null;
      });
      return selected;
    },
  },
  methods: {
    clickWeekDay(weekday) {
      weekday.selected = !weekday.selected;
    },
    makeTimerConfig() {
      const expression = [];
      if (this.periodicity === 'week' && this.selectedWeekdays.length > 0) {
          expression.push(this.getDateTime(this.startDate, this.startTime));
      } else {
        expression.push(this.makeCycle(
          (this.ends === 'times' ? this.times : ''),
          this.getDateTime(this.startDate, this.startTime),
          this.getPeriod(),
          (this.ends === 'ondate' ? this.getDateTime(this.endDate, this.startTime) : '')
        ));
      }
      return expression.join('|');
    },
    getDateTime(date, time) {
      const [hour, minutes] = time.split(":");
      return moment(date).set('hour', hour).set('minutes', minutes).format("YYYY-MM-DDTHH:mmZ");
    },
    getPeriod() {
      switch(this.periodicity) {
        case 'day': return `P${this.repeat}D`;
        case 'week': return `P${this.repeat}W`;
        case 'month': return `P${this.repeat}M`;
        case 'year': return `P${this.repeat}Y`;
      }
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
      width: 4em;
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
      width: 10em;
      height: 38px;
      font-size: 16px;
      padding-right: 5em;
  }
  .after:disabled {
      color: transparent;
  }
  .check-input {
      margin-top: 4px;
  }
  .check-input > .form-check-label {
      line-height:3em;
  }
  .check-input .form-check-input {
      margin-top: 1em;
  }
  .occurrences {
      position:absolute;
      right:1em;
      line-height: 3em;
  }
</style>

<style>
  .calendar {
      width: 16em;
  }
  .calendaron {
      margin-left: -2em;
  }
  .calendar .cell {
      height: 2em;
      line-height: 2em;
  }
  .start-date {
      background-color: white!important;
      width: 8em!important;
  }
  .end-date {
      background-color: white!important;
      width: 10em!important;
  }
  .date-disabled .end-date {
      background-color: #e9ecef!important;
      color: transparent;
  }
</style>
