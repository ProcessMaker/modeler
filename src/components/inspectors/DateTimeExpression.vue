<template>
  <div class="form-group">
    <label>Wait until specific date/time</label>
    <div>
      <datepicker v-model="startDate"
                  calendar-class="calendar" format="yyyy-MM-dd"
                  input-class="form-control start-date" 
                  class="start-date-div"
                  @selected="updateStartDate"></datepicker>
      <select v-model="startTime" class="form-control control time" @change="update">
        <option v-for="hour in hours" :key="hour" :value="hour">{{hour}}</option>
      </select>
    </div>
  </div>
</template>

<script>
import TimerExpression from './TimerExpression';

export default {
  extends: TimerExpression,
  props: {
    value: String,
  },
  methods: {
    parseTimerConfig(value) {
      this.resetTimerExpression();
      if (!value) {
        return;
      }
      try {
        const date = this.parseDateExpression(value);
        this.startDate = date.toDate();
        this.startTime = date.format('HH:mm');
      } catch (invalidExpression) {
        this.resetTimerExpression();
      }
    },
    makeTimerConfig() {
      return this.getDateTime(this.startDate, this.startTime);
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
  .start-date-div {
      vertical-align: middle;
      display: inline-block;
  }
  .time {
      width: 5em;
      height: 38px;
      font-size: 16px;
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
      width: 8em!important;
  }
</style>
