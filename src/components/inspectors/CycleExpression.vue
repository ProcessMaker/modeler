<template>
  <div class="mt-3">
    <label>{{ $t("Recurring loop repeats at time interval set below") }}</label>
    <b-input-group>
      <b-form-input v-model="repeat" type="number" min="1" class="form-control control repeat" :data-test="repeatInput" />

      <b-input-group-append>
        <b-form-select v-model="periodicity" data-test="periods">
          <option v-for="period in periods" :key="period.name" :value="period">
            {{ $t(period.name) }}
          </option>
        </b-form-select>
      </b-input-group-append>
    </b-input-group>
    <weekday-select
      v-if="periodicity && periodicity.isWeek"
      v-model="expression"
      class="pt-3"
      :select-weekdays="selectedWeekdays"
      :periodicity-value="periodicity.value"
      :repeat="repeat"
    />
  </div>
</template>

<script>
import last from "lodash/last";
import { DateTime } from "luxon";
import WeekdaySelect from "./WeekdaySelect.vue";

const periodNames = {
  minute: "minute",
  hour: "hour",
  day: "day",
  week: "week",
  month: "month"
};

export default {
  components: { WeekdaySelect },
  props: ["value", "repeatInput"],
  data() {
    const periods = [
      { name: periodNames.minute, value: "M", isTime: true },
      { name: periodNames.hour, value: "H", isTime: true },
      { name: periodNames.day, value: "D" },
      { name: periodNames.week, value: "W", isWeek: true },
      { name: periodNames.month, value: "M" }
    ];

    return {
      DateTime,
      repeat: null,
      periodicity: null,
      expression: null,
      periods,
      selectedWeekdays: null
    };
  },
  computed: {
    cycleExpression() {
      if (this.periodicity.isTime) {
        return `R/PT${this.repeat}${this.periodicity.value}`;
      }
      if (this.periodicity.isWeek && this.expression) {
        return this.expression;
      }
      return `R/P${this.repeat}${this.periodicity.value}`;
    }
  },
  watch: {
    value: {
      handler(value) {
        this.periodicity = this.getPeriodFromDelayString(value);
        this.repeat = this.getRepeatNumberFromDelayString(value);
        this.selectedWeekdays = this.getSelectedWeekdaysFromDelayString(value);
      },
      immediate: true
    },
    cycleExpression: {
      handler(cycleExpression) {
        this.$emit("input", cycleExpression);
      },
      immediate: true
    }
  },
  methods: {
    getSelectedWeekdaysFromDelayString(delayString) {
      const expression = delayString.split("|");
      const selectedWeekdays = [];
      expression.forEach((exp) => {
        const match = exp.match(/R(\d*)\/([^/]+)\/PT?(\d+)(\w)(?:\/([^/]+))?/);
        if (match) {
          const dayOfWeek = DateTime.fromISO(match[2], { zone: "utc" }).toLocal().weekday;
          selectedWeekdays.push(dayOfWeek);
        }
      });
      return selectedWeekdays;
    },
    getPeriodFromDelayString(delayString) {
      const isTimePeriod = this.isTimePeriod(delayString);
      const periodicity = last(delayString);

      if (periodicity === "M") {
        const periodName = isTimePeriod ? periodNames.minute : periodNames.month;

        return this.periods.find(({ name }) => name === periodName);
      }

      return this.periods.find(({ value }) => value === periodicity);
    },
    isTimePeriod(delayString) {
      return delayString[3] === "T";
    },
    getRepeatNumberFromDelayString(delayString) {
      const match = delayString.match(/PT?(\d+)/);
      return match ? match[1] : 1;
    }
  }
};
</script>
