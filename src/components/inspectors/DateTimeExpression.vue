<template>
  <div class="mt-3">
    <form-date-picker
      :data-test="'date-time'"
      :label="$t('Wait until specific date/time')"
      control-class="form-control"
      :data-format="'datetime'"
      :format="'MM/DD/YYYY h:mm A'"
      class="p-0"
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
