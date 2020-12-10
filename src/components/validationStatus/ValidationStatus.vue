<template>
  <b-card-footer class="p-0 border-0 statusbar d-flex align-items-center justify-content-end pr-3 pl-3 border-top">
    <slot />
    <b-btn
      class="mr-auto"
      :disabled="!xmlManager"
      variant="secondary"
      size="sm"
      data-test="downloadXMLBtn"
      @click="xmlManager && xmlManager.download()"
    >
      <i class="fas fa-download mr-1"/>
      {{ $t('Download BPMN') }}
    </b-btn>

    <div class="status-bar-container d-flex align-items-center justify-content-end">
      <template v-if="autoValidate">
        <button v-if="numberOfProblemsToDisplay === 0" type="button" data-test="validation-list-valid" class="btn btn-light" :disabled="true">
          {{ $t('BPMN Valid') }}
          <span class="badge badge-success badge-pill">
            <font-awesome-icon :icon="faCheck"/>
          </span>
        </button>
        <button v-else type="button" data-test="validation-list-toggle" class="btn btn-light"
          @click="shouldDisplayProblemsPanel = !shouldDisplayProblemsPanel"
        >
          {{ $t('BPMN Issues') }}
          <span class="badge badge-primary badge-pill">
            {{ numberOfProblemsToDisplay }}
          </span>
          <font-awesome-icon class="ml-3" :icon="chevronIcon"/>
        </button>
      </template>

      <span class="divider"/>

      <b-form-checkbox
        data-test="validation-toggle"
        class="h-100 d-flex align-items-center"
        v-model="autoValidate"
        switch
      >
        {{ $t('Auto validate') }}
      </b-form-checkbox>

      <transition name="slide">
        <div v-if="isProblemsPanelDisplayed" class="validation-container position-absolute text-left">
          <dl class="validation-container__list align-items-baseline" data-test="validation-list">
            <template v-for="(error, index) in errorList">
              <dt class="text-capitalize" :key="`${error.errorId}_${index}`">
                <font-awesome-icon
                  class="status-bar-container__status-icon ml-1 mr-1 mt-1"
                  :style="{ color: isErrorCategory(error) ? errorColor : warningColor }"
                  :icon="isErrorCategory(error) ? faTimesCircle: faExclamationTriangle"
                />
                {{ error.errorKey }}
              </dt>
              <dd :key="`${ error.errorId }_${ index }_dd`">
                <p class="pl-4 mb-0 font-italic">{{ error.message }}.</p>
                <p class="pl-4 mb-0" v-if="error.id"><span class="font-weight-bold">{{ $t('Node ID') }}:</span> {{
                  error.id }}</p>
              </dd>
            </template>
            <template v-for="(warning, index) in warnings">
              <dt class="text-capitalize" :key="warning.title + index">
                <font-awesome-icon class="status-bar-container__status-icon ml-1 mr-1 mt-1"
                  :style="{ color: warningColor }" :icon="faExclamationTriangle"
                />
                {{ warning.title }}
              </dt>
              <dd :key="warning.title + index + '__dd'" class="font-italic pl-4">{{ warning.text }}</dd>
            </template>
          </dl>
        </div>
      </transition>
    </div>
  </b-card-footer>
</template>

<script>
import { faCheck, faChevronDown, faChevronUp, faExclamationTriangle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import store from '@/store';
import validationErrorList from './errorListUtil';

export default {
  components: {
    FontAwesomeIcon,
  },
  props: ['validationErrors', 'warnings', 'xmlManager'],
  data() {
    return {
      shouldDisplayProblemsPanel: false,
      errorColor: '#D9534F',
      warningColor: '#F0AD4E',
      faExclamationTriangle,
      faTimesCircle,
      faChevronUp,
      faChevronDown,
      faCheck,
    };
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
      return validationErrorList(this.validationErrors);
    },
    numberOfProblemsToDisplay() {
      return this.errorList.length + this.warnings.length;
    },
    isProblemsPanelDisplayed() {
      return this.shouldDisplayProblemsPanel && this.numberOfProblemsToDisplay > 0 && this.autoValidate;
    },
    chevronIcon() {
      return this.shouldDisplayProblemsPanel ? faChevronUp : faChevronDown;
    },
  },
  methods: {
    isErrorCategory(error) {
      return error.category === 'error';
    },
  },
};
</script>
<style lang="scss" src="./validationStatus.scss" scoped />
