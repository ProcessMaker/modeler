<template>
  <div class="form-group">
    <label>Start Date</label>
    <div>
    <datepicker calendar-class="calendar" format="yyyy-MM-dd" input-class="form-control start-date" class="start-date-div"></datepicker>
    <select class="form-control control time">
      <option v-for="hour in hours" :value="hour">{{hour}}</option>
    </select>
    </div>
    <label>Repeat every</label>
    <div>
      <input type="number" min="0" class="form-control control repeat">
      <select class="form-control control periodicity">
        <option value="day">day</option>
        <option value="week">week</option>
        <option value="month">month</option>
        <option value="year">year</option>
      </select>
    </div>
    <label>Repeat on</label>
    <div>
      <span v-for="(day, index) in weekdays" :key="index" 
            class="badge badge-pill weekday"
            :class="{'badge-primary': day.selected, 'badge-light': !day.selected}"
            @click="clickWeekDay(day)">{{day.initial}}</span>
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
            <input type="radio" class="form-check-input" name="optradio" value="on" v-model="ends">On &nbsp;
          </label>
            <datepicker calendar-class="calendar calendaron" :disabled="ends!=='on'" format="yyyy-MM-dd"
                        input-class="form-control end-date"
                        class=" control float-right"
                        :class="{'date-disabled' : ends!=='on'}"></datepicker>
      </div>
      <div class="form-check check-input">
        <label class="form-check-label">
          <input type="radio" class="form-check-input" name="optradio" value="after" v-model="ends">After &nbsp;
        </label>
        <input type="number" min="0" :disabled="ends!=='after'" 
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
    Datepicker
  },
  data() {
    const date = moment().set('hour', 0).set('minutes', 0);
    const hours =[];
    for(let i=0;i<48;i++) {
      hours.push(date.format('HH:mm'));
      date.add(30, 'minutes');
    }
    return {
      ends: 'never',
      hours,
      weekdays: [
        {
          initial: 'S',
          selected: false,
        },
        {
          initial: 'M',
          selected: false,
        },
        {
          initial: 'T',
          selected: false,
        },
        {
          initial: 'W',
          selected: false,
        },
        {
          initial: 'T',
          selected: false,
        },
        {
          initial: 'F',
          selected: false,
        },
        {
          initial: 'S',
          selected: false,
        },
      ],
      repeat: '',
      periodicity: 'week',
    };
  },
  methods: {
    clickWeekDay(weekday) {
      weekday.selected = !weekday.selected;
    }
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
      width: 8em;
  }
  .end-date {
      background-color: white!important;
      width: 10em;
  }
  .date-disabled .end-date {
      background-color: #e9ecef!important;
  }
</style>
