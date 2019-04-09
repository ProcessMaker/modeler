<template>
  <div class="form-group">
    <form-date-picker
      :label="$t('Wait until specific date/time')"
      control-class="form-control"
      :format="DateTime.DATETIME_SHORT"
      :minuteStep="30"
      :phrases="{ ok: $t('Save'), cancel: $t('Cancel') }"
      :value="value"
      @input="$emit('input', $event)"
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
};
</script>
