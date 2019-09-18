<template>
  <div class="mt-3">
    <form-date-picker
      :label="$t('Wait until specific date/time')"
      control-class="form-control"
      :format="DateTime.DATETIME_SHORT"
      :minuteStep="30"
      class="p-0"
      :phrases="{ ok: $t('Save'), cancel: $t('Cancel') }"
      :value="convertFromUTC(value)"
      @input="emitValue"
    />
  </div>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  data() {
    return {
      DateTime,
    };
  },
  props: {
    value: String,
  },
  methods: {
    convertFromUTC(utcDatetimeString) {
      return DateTime
        .fromISO(utcDatetimeString, { zone: 'utc' })
        .toLocal()
        .toISO();
    },
    emitValue(localDatetimeString) {
      const utcDatetimeString = DateTime
        .fromISO(localDatetimeString)
        .toUTC()
        .toISO();

      this.$emit('input', utcDatetimeString);
    },
  },
};
</script>
