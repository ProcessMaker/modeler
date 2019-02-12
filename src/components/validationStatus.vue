<template>
  <div>
    <div class="validation-container" v-if="toggleValidationPanel">
      <span class="validation-container__defaultMessage" v-if="!numberOfValidationErrors">no problems to report</span>
      <div class="validation-container__list" v-for="error in errorList" :key="error.id">
        <span class="validation-container__list--id">{{ error.id }}</span>
        <span class="validation-container__list--message">
          <span class="validation-container__list--key">{{ error.errorKey }}</span>
          <span>{{ error.message }}</span>
        </span>
        <span class="validation-container__list--errorCategory"
              :style="[ error.category === 'error'
              ? { 'background-color': `${ errorColor }` }
              : { 'background-color': `${ warningColor }` }]">
              {{ error.category }}
        </span>
      </div>
    </div>
     <div class="status-bar-container" @click="toggleValidationPanel = !toggleValidationPanel">
      <span class="statusBar-container__status-text">Problems {{ numberOfValidationErrors }}</span>
      <font-awesome-icon class="status-bar-container__status-icon" :style="{ color: statusColor }" :icon="statusIcon" />
      <font-awesome-icon class="status-bar-container__status-ellipsis" :icon="ellipsisIcon" />
    </div>
  </div>
</template>

<script>
import { faCheckCircle, faTimesCircle, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  components : {
    FontAwesomeIcon,
  },
  props: ['validationErrors'],
  data() {
    return {
      toggleValidationPanel: false,
      errorColor: '#D9534F',
      warningColor: '#F0AD4E',
      validColor: '#40C057',
    };
  },
  computed: {
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
    ellipsisIcon() {
      return faEllipsisV;
    },
    statusIcon() {
      return this.hasValidationErrors
        ? faTimesCircle
        : faCheckCircle;
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
$primary-white: #F0F3F7;
$seconadry-grey: #555555;
$border-color: #aaaaaa;
$text-size-sm: 0.85rem;
$validation-container-height: 20rem;
$validation-container-width: 28rem;
$status-bar-container-height: 2.5rem;
$status-bar-container-width: 8rem;
$message-label-pill-width: 1.5rem;
$message-label-pill-height: 4rem;
$error-color: #D9534F;
$warning-color: #F0AD4E;

.status-bar-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: $text-size-sm;
  color: $seconadry-grey;
  height: $status-bar-container-height;
  width: $status-bar-container-width;
  cursor: pointer;
}

.validation-container {
  position:absolute;
  bottom:0;
  right:0;
  height: $validation-container-height;
  width: $validation-container-width;
  background-color: $primary-white;
  overflow: scroll;
  margin-bottom: 2.5rem;
  border: 1px solid $border-color;

  &__defaultMessage {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-transform: capitalize;
  }

  &__list {
    display: flex;
    justify-content: space-between;
    padding: 1rem;

    &--message {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      text-transform: capitalize;
    }

    &--errorCategory {
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary-white;
      border-radius: 0.75rem;
      height: $message-label-pill-width;
      width: $message-label-pill-height;
      font-size: $text-size-sm;
    }

    &--key {
      font-weight: 700;
    }

    &--id {
      color: $seconadry-grey;
      text-transform: none;
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
