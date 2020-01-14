<template>
  <div class="form-group position-relative">
    <label v-uni-for="name">{{ label }}</label>
    <date-picker
      v-model="date"
      :config="config"
      :value="date"
      :disabled="disabled"
      :placeholder="placeholder"
      :data-test="dataTest"
    />
    <div v-if="(validator && validator.errorCount) || error" class="invalid-feedback d-block">
      <div v-for="(error, index) in validator.errors.get(this.name)" :key="index">{{ error }}</div>
      <div v-if="error">{{ error }}</div>
    </div>
    <small v-if="helper" class="form-text text-muted">{{ helper }}</small>
  </div>
</template>

<script>
import { createUniqIdsMixin } from 'vue-uniq-ids';
import ValidationMixin from './mixins/validation';
import DataFormatMixin from './mixins/DataFormat';
import datePicker from 'vue-bootstrap-datetimepicker';
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';
import moment from 'moment-timezone';
import { getLang, getTimezone, getUserDateFormat, getUserDateTimeFormat } from '../dateUtils';

const uniqIdsMixin = createUniqIdsMixin();
const datetimeStdFormat = 'YYYY-MM-DDTHH:mm:ssZZ';

export default {
  mixins: [uniqIdsMixin, ValidationMixin, DataFormatMixin],
  components: {
    datePicker,
  },
  props: {
    emitIso: Boolean,
    name: String,
    placeholder: String,
    label: String,
    error: String,
    helper: String,
    dataFormat: String,
    value: String,
    inputClass: {type: [String, Array, Object], default: 'form-control'},
    dataTest: String,
    disabled: null,
  },
  data() {
    return {
      date: null,
      config: {
        format: datetimeStdFormat,
        timeZone: getTimezone(),
        locale: getLang(),
        useCurrent: false,
        showClear: true,
        showClose: true,
        icons: {
          time: 'far fa-clock',
          date: 'far fa-calendar',
          up: 'fas fa-arrow-up',
          down: 'fas fa-arrow-down',
          previous: 'fas fa-chevron-left',
          next: 'fas fa-chevron-right',
          today: 'fas fa-calendar-check',
          clear: 'far fa-trash-alt',
          close: 'far fa-times-circle',
        },
      },
    };
  },
  watch: {
    date: {
      deep: true,
      handler(value) {
        if (!value) {
          return;
        }

        moment.tz.setDefault(this.config.timeZone);
        let current = moment(value).format(this.config.format);
        if (this.emitIso) {
          current = moment(value).toISOString();
        }
        this.$emit('input', current);
      },
    },
    dataFormat: {
      immediate: true,
      handler() {
        this.config.format = this.dataFormat === 'datetime'
          ? getUserDateTimeFormat()
          : getUserDateFormat();

        moment.tz.setDefault(this.config.timeZone);
        this.date = moment(this.value).tz(this.config.timeZone);
      },
    },
    value: {
      immediate:true,
      // eslint-disable-next-line no-unused-vars
      handler: function handler(_value) {
        this.showClear=true;
      },
    },
  },
};
</script>

<style>
.inspector-container .bootstrap-datetimepicker-widget.dropdown-menu {
  font-size: 11px;
}
</style>
