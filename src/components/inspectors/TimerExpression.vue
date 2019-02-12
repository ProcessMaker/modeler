<template>
  <div class="form-group">
    <label>Start Date</label>
    <div>
    <datepicker calendar-class="calendar" format="yyyy-MM-dd" input-class="form-control start-date" class="start-date-div"></datepicker>
    <select class="form-control control time">
      <option value="00:00">00:00</option>
      <option value="01:00">01:00</option>
      <option value="02:00">02:00</option>
      <option value="03:00">03:00</option>
      <option value="04:00">04:00</option>
      <option value="05:00">05:00</option>
      <option value="06:00">06:00</option>
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
    <div>
      <label>Repeat on</label>
      <div>
        <span v-for="(day, index) in weekdays" :key="index" 
              class="badge badge-pill weekday"
              :class="{'badge-primary': day.selected, 'badge-light': !day.selected}"
              @click="clickWeekDay(day)">{{day.initial}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker';

export default {
  components: {
    Datepicker
  },
  data() {
    return {
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
</style>

<style>
  .calendar {
      width: 16em;
  }
  .calendar .cell {
      height: 2em;
      line-height: 2em;
  }
  .start-date {
      background-color: white!important;
      width: 8em;
  }
</style>
