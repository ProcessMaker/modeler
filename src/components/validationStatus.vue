<template>
  <div>
    <div class="validation-container" v-if="toggleValidationPanel">
      <span class="validation-container__defaultMessage" v-if="!numberOfValidationErrors">no problems to report</span>
      <div class="validation-container__list"  v-for="error in errorList" :key="error.id">
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
     <div class="statusBar-container" @click="toggleValidationPanel = !toggleValidationPanel">
      <span class="statusBar-container__status-text">Problems {{ numberOfValidationErrors }}</span>
      <font-awesome-icon class="statusBar-container__status-icon" :style="{ color: statusColor }" :icon="statusIcon" />
      <font-awesome-icon class="statusBar-container__status-ellipsis" :icon="ellipsisIcon" />
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
      if (!this.validationErrors) {
        return 0;
      }

      return Object.entries(this.validationErrors).reduce((numberOfErrors, [,errors]) => {
        return numberOfErrors + errors.length;
      }, 0);
    },
  },
};
</script>

<style scoped lang="scss">
$warningColor: #F0AD4E;
$errorColor: #D9534F;

.statusBar-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 0.85rem;
  color: #555555;
  height: 2.5rem;
  cursor: pointer;
  width: 8rem;
}

.validation-container {
  position:absolute;
  bottom:0;
  right:0;
  height: 20rem;
  width: 28rem;
  background-color: #F0F3F7;
  overflow: scroll;
  margin-bottom: 2.5rem;
  border: 1px solid #aaaaaa;

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
    padding: 1rem 1rem 1rem 1rem;
    text-transform: capitalize;

    &--message {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
    }

    &--errorCategory {
      display: flex;
      justify-content: center;
      color: #fff;
      border-radius: 0.75rem;
      height: 1.5rem;
      width: 4rem;
    }

    &--key {
      font-weight: 700;
    }

    &--id {
      text-transform: none;
    }
  }
}
</style>
