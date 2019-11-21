<template>
  <div class="status-bar-container d-flex align-items-center justify-content-end">
    <b-form-checkbox
      data-test="validation-toggle"
      class="h-100 d-flex align-items-center"
      v-model="autoValidate"
      switch
    >
      {{ $t('Auto validate') }}
    </b-form-checkbox>

    <span class="divider" />

    <div v-if="toggleValidationPanel && numberOfProblems" class="validation-container position-absolute text-left" data-test="validation-list">
      <div class="validation-container-list d-flex align-items-baseline" v-for="error in errorList" :key="`${error.id}_${error.errorKey}`">
        <font-awesome-icon class="status-bar-container-status-icon ml-1 mr-2 mt-1" :style="{ color: iconColor }" :icon="validationIcon" />
        <div class="validation-container-list-message">
          <h6 class="text-capitalize mb-0">{{ error.errorKey }}</h6>
          <p class="mb-0"><em>{{ error.message }}.</em></p>
          <p class="mb-0" v-if="error.id"><strong>Node ID:</strong> {{ error.id }}</p>
        </div>
      </div>

      <div class="validation-container-list d-flex align-items-baseline" v-for="(warning, index) in warnings" :key="index">
        <font-awesome-icon class="status-bar-container-status-icon ml-1 mr-2 mt-1" :style="{ color: warningColor }" :icon="faExclamationTriangle" />
        <div class="validation-container-list-message">
          <h6 class="text-capitalize mb-0">{{ warning.title }}</h6>
          <p class="mb-0"><em>{{ warning.text }}.</em></p>
        </div>
      </div>
    </div>

    <button v-if="hasNoIssues" type="button" class="btn btn-light" :disabled="hasNoIssues" @click="toggleValidationPanel = !toggleValidationPanel">
      BPMN Valid
      <span class="badge badge-success badge-pill">
        <font-awesome-icon :icon="checkMarkIcon" />
      </span>
    </button>
    <button v-else type="button" data-test="validation-list-toggle" class="btn btn-light" @click="toggleValidationPanel = !toggleValidationPanel">
      BPMN Issues
      <span class="badge badge-primary badge-pill">
        {{ numberOfProblems }}
      </span>
      <font-awesome-icon class="ml-3" :icon="toggleValidationPanel? chevronUpIcon : chevronDownIcon" />
    </button>
  </div>
</template>

<script>
import { faCheck, faCheckCircle, faChevronDown, faChevronUp, faExclamationTriangle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import store from '@/store';

export default {
  components: {
    FontAwesomeIcon,
  },
  props: ['validationErrors', 'warnings'],
  data() {
    return {
      toggleValidationPanel: false,
      errorColor: '#D9534F',
      warningColor: '#F0AD4E',
      toggleWarningsPanel: false,
      faExclamationTriangle,
      faCheckCircle,
      chevronUpIcon: faChevronUp,
      chevronDownIcon: faChevronDown,
      checkMarkIcon: faCheck,
    };
  },
  watch: {
    warnings() {
      this.toggleWarningsPanel = this.warnings.length > 0;
    },
    hasIssues(value) {
      if (value) {
        this.toggleValidationPanel = false;
      }
    },
  },
  computed: {
    autoValidate: {
      get() {
        return store.getters.autoValidate;
      },
      set(autoValidate) {
        store.commit('setAutoValidate', autoValidate);
      },
    },
    hasNoIssues() {
      return this.numberOfProblems === 0;
    },
    errorList() {
      return Object.entries(this.validationErrors)
        .flatMap(([errorKey, errors]) => {
          return errors.flatMap(error => {
            return { ...error, errorKey };
          });
        });
    },
    getCategory() {
      return this.errorList.find((category) => {
        return category;
      });
    },
    validationIcon() {
      return this.isError
        ? faTimesCircle
        : faExclamationTriangle;
    },
    isError() {
      return this.getCategory.category === 'error';
    },
    iconColor() {
      return this.isError
        ? `${this.errorColor}`
        : `${this.warningColor}`;
    },
    numberOfProblems() {
      return this.errorList.length + this.warnings.length;
    },
  },
};
</script>

<style scoped lang="scss">
$primary-white: #f7f7f7;
$secondary-grey: #555555;
$border-color: rgba(0, 0, 0, 0.125);
$message-container-width: 18rem;
$validation-container-height: 14rem;
$validation-container-width: 25rem;
$status-bar-container-height: 3rem;

.status-bar-container {
  color: $secondary-grey;
  height: $status-bar-container-height;

  &-status {
    cursor: pointer;
  }
}

.divider {
  height: 1.25rem;
  width: 2px;
  background: #d4d4d4;
  margin: 0 1rem;
}

.validation-container {
  cursor: default;
  bottom: 0;
  right: 0;
  height: $validation-container-height;
  width: $validation-container-width;
  background-color: $primary-white;
  overflow: auto;
  margin-bottom: 3rem;
  border: 1px solid $border-color;
  border-radius: 0.25rem;
  border-right: none;

  &-list {
    padding: 0.5rem;
    word-wrap: break-word;

    &-message {
      width: $message-container-width;
    }
  }
}
</style>
