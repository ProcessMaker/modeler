<template>
  <div>
    <div data-test="validation-list" class="validation-container position-absolute text-left" v-if="toggleValidationPanel">
      <span
        class="validation-container__defaultMessage d-flex justify-content-center align-items-center h-100"
        v-if="!numberOfValidationErrors"
      >{{ $t('no problems to report') }}</span>

      <div class="validation-container__list d-flex justify-content-between" v-for="error in errorList" :key="`${error.id}_${error.errorKey}`">
        <span class="validation-container__list--errorCategory d-flex justify-content-center">
          <font-awesome-icon class="status-bar-container__status-icon" :style="{ color: iconColor }" :icon="valditionIcon" />
        </span>
        <span class="validation-container__list--id">
          {{ error.id }}
        </span>
        <span class="validation-container__list--message">
          <span class="validation-container__list--key">{{ error.errorKey }}</span>
          <div>{{ $t(error.message) }}</div>
        </span>
      </div>
    </div>

    <div
      data-test="validation-list"
      class="validation-container position-absolute text-left"
      v-if="toggleWarningsPanel"
    >
      <span
        class="validation-container__defaultMessage d-flex justify-content-center align-items-center h-100"
        v-if="warnings.length === 0"
      >{{ $t('no warnings to report') }}</span>

      <div
        class="validation-container__list d-flex"
        v-for="(error, index) in warnings" :key="index"
      >
        <span class="validation-container__list--errorCategory d-flex justify-content-center mr-2">
          <font-awesome-icon class="status-bar-container__status-icon" :style="{ color: warningColor }" :icon="faExclamationTriangle" />
        </span>

        <span class="validation-container__list--message">
          <span class="validation-container__list--key">{{ error.title }}</span>
          <div>{{ $t(error.text) }}</div>
        </span>
      </div>
    </div>

    <div class="status-bar-container d-flex align-items-center justify-content-end">
      <b-form-checkbox
        data-test="validation-toggle"
        class="h-100 d-flex align-items-center"
        v-model="autoValidate"
        switch
      >
        {{ $t('Auto validate') }}
      </b-form-checkbox>

      <div class="divider"/>

      <div data-test="validation-list-toggle" class="status-bar-container__status" @click="toggleValidationPanel = !toggleValidationPanel; toggleWarningsPanel = false">
        <div class="d-flex align-items-center">
          <span class="status-bar-container__status-text">{{ $t('Problems') }} {{ numberOfValidationErrors }}</span>
          <font-awesome-icon class="status-bar-container__status-icon h-100" :style="{ color: statusColor }" :icon="statusIcon" />
          <font-awesome-icon class="status-bar-container__status-ellipsis" :icon="ellipsisIcon" />
        </div>
      </div>

      <div class="divider"/>

      <div class="status-bar-container__status" @click="toggleWarningsPanel = !toggleWarningsPanel; toggleValidationPanel = false">
        <div class="d-flex align-items-center">
          <span class="status-bar-container__status-text">{{ $t('Warnings') }} {{ warnings.length }}</span>
          <font-awesome-icon
            class="status-bar-container__status-icon h-100"
            :style="{ color: warnings.length > 0 ? warningColor : validColor }"
            :icon="warnings.length > 0 ? faExclamationTriangle : faCheckCircle"
          />
          <font-awesome-icon class="status-bar-container__status-ellipsis" :icon="ellipsisIcon" />
        </div>
      </div>

      <button type="button" class="btn btn-light">
        BPMN Issues
        <span class="badge badge-primary badge-pill">{{ warnings.length + numberOfValidationErrors }}</span>
        <font-awesome-icon class="ml-3"   :icon="chevronDownIcon" />
      </button>

    </div>
  </div>
</template>

<script>
import { faCheckCircle, faTimesCircle, faEllipsisV, faExclamationTriangle, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import store from '@/store';

export default {
  components : {
    FontAwesomeIcon,
  },
  props: ['validationErrors', 'warnings'],
  data() {
    return {
      toggleValidationPanel: false,
      errorColor: '#D9534F',
      warningColor: '#F0AD4E',
      validColor: '#40C057',
      toggleWarningsPanel: this.warnings.length > 0,
      faExclamationTriangle,
      faCheckCircle,
      chevronUpIcon: faChevronUp,
      chevronDownIcon: faChevronDown,
    };
  },
  watch: {
    warnings() {
      this.toggleWarningsPanel = this.warnings.length > 0;
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
    errorList() {
      return Object.entries(this.validationErrors).reduce((errorList, [ errorKey, errors ]) => {
        const errorListItems = errors.map((error) => {
          return  {
            id: error.id,
            errorKey,
            category: error.category,
            message: error.message,
          };
        });

        errorList.push(...errorListItems);
        return errorList;
      }, []);
    },
    getCategory() {
      const errorCategory = this.errorList.find((category) => {
        return category;
      });
      return errorCategory;
    },
    ellipsisIcon() {
      return faEllipsisV;
    },
    statusIcon() {
      return this.hasValidationErrors
        ? faTimesCircle
        : faCheckCircle;
    },
    valditionIcon() {
      return this.isErrorOrWarning
        ? faTimesCircle
        : faExclamationTriangle;
    },
    isErrorOrWarning() {
      return this.getCategory.category === 'error' ? true : false;
    },
    iconColor() {
      return this.isErrorOrWarning
        ? `${ this.errorColor }`
        : `${ this.warningColor }`;
    },
    statusColor() {
      return this.hasValidationErrors
        ? `${ this.errorColor }`
        : `${ this.validColor }`;
    },
    hasValidationErrors() {
      return this.numberOfValidationErrors > 0;
    },
    numberOfValidationErrors() {
      return this.errorList.length;
    },
  },
};
</script>

<style scoped lang="scss">
$primary-white: #f7f7f7;
$secondary-grey: #555555;
$secondary-blue: #3397e1;
$border-color: rgba(0, 0, 0, 0.125);
$id-container-width: 6.5rem;
$message-container-width: 18rem;
$error-category-width: 1rem;
$validation-container-height: 14rem;
$validation-container-width: 25rem;
$status-bar-container-height: 3rem;
$error-color: #D9534F;
$warning-color: #F0AD4E;
$button-color: #3BD7FF;

.status-bar-container {
  color: $secondary-grey;
  height: $status-bar-container-height;
  cursor: pointer;

  &__status {
    cursor: pointer;
  }

  &__status-ellipsis:hover {
    color: $secondary-blue;
  }

  &__status-icon {
    margin: 0 0.75rem;
  }
}

.divider {
  height: 1.25rem;
  width: 2px;
  background: #d4d4d4;
  margin: 0 1rem;
}

.validation-container {
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

  &__defaultMessage {
    text-transform: capitalize;
  }

  &__list {
    padding: 1rem;
    word-wrap: break-word;

    &--id {
      width: $id-container-width;
      color: $secondary-grey;
      text-transform: none;
    }

    &--message {
      width: $message-container-width;
    }

    &--errorCategory {
      padding: 0.25rem 1rem 0 0.5rem;
      width: $error-category-width;
    }

    &--key {
      font-weight: 700;
      text-transform: capitalize;
    }
  }

  .label-background-warning {
    background-color: $warning-color;
  }

  .label-background-error {
    background-color: $error-color;
  }
}
</style>
