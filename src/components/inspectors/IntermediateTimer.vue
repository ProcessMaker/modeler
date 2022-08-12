<template>
  <div>
    <label>{{ $t("Type") }}</label>
    <b-input-group>
      <b-form-select :value="timerPropertyName" data-test="intermediateTypeSelect" @change="changeType">
        <option value="timeDuration">{{ $t("Duration") }}</option>
        <option value="timeDate">{{ $t("Date/Time") }}</option>
        <option value="timeCycle">{{ $t("Cycle") }}</option>
      </b-form-select>
    </b-input-group>

    <small class="form-text text-muted">{{ $t(typeHelper) }}</small>
    <component :is="component" v-model="timerProperty" :has-ends="false" repeat-label="Wait for" week-label="Every" />
  </div>
</template>

<script>
import { DateTime } from "luxon";
import { defaultDurationValue } from "@/components/nodes/intermediateTimerEvent";
import DurationExpression from "./DurationExpression";
import DateTimeExpression from "./DateTimeExpression";
import CycleExpression from "./CycleExpression";

const types = {
  timeDuration: "DurationExpression",
  timeDate: "DateTimeExpression",
  timeCycle: "CycleExpression"
};

export default {
  components: {
    DurationExpression,
    DateTimeExpression,
    CycleExpression
  },
  props: {
    value: {
      type: Object
    },
    typeHelper: {
      type: String,
      default: "Select the type of delay"
    }
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
      }
    },
    timerPropertyName() {
      return this.value.type;
    }
  },
  methods: {
    changeType(type) {
      const defaultValue = this.isDelayType(type) || this.isCycleType(type) ? defaultDurationValue : DateTime.local().toUTC().toISO();
      this.emitChange(type, defaultValue);
    },
    isDelayType(type) {
      return types[type] === types.timeDuration;
    },
    isCycleType(type) {
      return types[type] === types.timeCycle;
    },
    emitChange(type, body) {
      this.$emit("input", { type, body });
    }
  }
};
</script>
