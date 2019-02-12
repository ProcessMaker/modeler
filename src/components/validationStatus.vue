<template>
  <div class="statusbar">
    <div class="validation-container">
      <div class="validation-container__header">Problems {{ numberOfValidationErrors }}</div>


    </div>
    {{ statusText }}
    <font-awesome-icon :style="{ color: statusColor }" :icon="statusIcon" />
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
    errorList() {
      return Object.entries(this.validationErrors).reduce((numberOfErrors, [,errors]) => {
        return numberOfErrors + errors.length;
      }, 0);
    },
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

<style scoped lang="scss">
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

.validation-container {
  height: 20rem;
  width: 28rem;
  background-color: #F0F3F7;

  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 1rem;
    font-size: 1rem;
    height: 3rem;
    background-color: #fff;
  }
}
</style>
