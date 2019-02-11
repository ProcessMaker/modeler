<template>
  <div class="statusbar">
    <div>
      <slot name="secondary"></slot>
    </div>
    <div>
      {{ statusText }}
      <font-awesome-icon :style="{ color: statusColor }" :icon="statusIcon" />
    </div>
  </div>
</template>

<script>
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  components : {
    FontAwesomeIcon,
  },
  props: ['validationErrors'],
  data() {
    return {
    };
  },
  computed: {
    statusIcon() {
      return this.hasValidationErrors
        ? faTimesCircle
        : faCheckCircle;
    },
    statusColor() {
      return this.hasValidationErrors
        ? 'red'
        : 'green';
    },
    hasValidationErrors() {
      return this.numberOfValidationErrors > 0;
    },
    numberOfValidationErrors() {
      if (!this.validationErrors) {
        return 0;
      }

      return Object.entries(this.validationErrors).reduce((numberOfErrors, [,errors]) => {
        return numberOfErrors + errors.length;
      }, 0);
    },
    statusText() {
      return this.hasValidationErrors
        ? `${this.numberOfValidationErrors} error${this.numberOfValidationErrors === 1 ? '' : 's'} detected`
        : 'No errors detected';
    },
  },

};
</script>

<style scoped>
.statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #aaaaaa;
  background-color: #eeeeee;
  padding-left: 16px;
  padding-right: 16px;
  font-size: 14px;
  color: #555555;
  font-weight: normal;
}
</style>
