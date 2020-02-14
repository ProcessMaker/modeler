<template>
  <b-card-footer class="p-0 border-0">
    <div class="statusbar d-flex align-items-center justify-content-end pr-3 border-top">
      <div>
        <div class="status-bar-container d-flex align-items-center justify-content-end">
          <b-button
            data-test="run-simulation-check"
            @click="checkSimulation"
          >
            {{ $t('Check simulation') }}
          </b-button>

          <template v-if="autoValidate">
            <button v-if="numberOfProblemsToDisplay === 0" type="button" class="btn btn-light" :disabled="true">
              {{ $t('BPMN Valid') }}
              <span class="badge badge-success badge-pill">
                <font-awesome-icon :icon="faCheck" />
              </span>
            </button>
            <button v-else type="button" data-test="validation-list-toggle" class="btn btn-light"
              @click="shouldDisplayProblemsPanel = !shouldDisplayProblemsPanel"
            >
              {{ $t('BPMN Issues') }}
              <span class="badge badge-primary badge-pill">
                {{ numberOfProblemsToDisplay }}
              </span>
              <font-awesome-icon class="ml-3" :icon="chevronIcon" />
            </button>
          </template>

          <span class="divider" />

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
                <template v-for="error in errorList">
                  <dt class="text-capitalize" :key="error.errorId">
                    <font-awesome-icon
                      class="status-bar-container__status-icon ml-1 mr-1 mt-1"
                      :style="{ color: isErrorCategory(error) ? errorColor : warningColor }"
                      :icon="isErrorCategory(error) ? faTimesCircle: faExclamationTriangle"
                    />
                    {{ error.errorKey }}
                  </dt>
                  <dd :key="`${ error.errorId }_dd`">
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

          <transition name="slide">

            <div v-if="isSimulationPanelDisplayed" class="simulation-container position-absolute text-left">
              <div role="tablist">
                <b-card v-for="(test,index) in simulation.paths" :key="`simulation${index}`" no-body class="mb-1" :bg-variant="simulationMeta[test.status].variant" text-variant="white">
                  <b-card-header header-tag="header" class="p-1" role="tab">
                    {{ simulationMeta[test.status].title }}
                    <b-button class="float-right" variant="outline-light" @click="toggleSimulationTest(index)" size="sm">
                      <font-awesome-icon
                        :icon="isSimulationTestOpen(index) ? faMinus : faPlus"
                      />
                    </b-button>
                  </b-card-header>
                  <b-collapse :visible="isSimulationTestOpen(index)" role="tabpanel">
                    <b-table hover :items="test.path" :table-variant="simulationMeta[test.status].variant" :small="true" :borderless="true" head-variant="dark" />
                  </b-collapse>
                </b-card>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </b-card-footer>
</template>

<script>
import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faExclamationTriangle,
  faTimesCircle,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import store from '@/store';
import validationErrorList from './errorListUtil';

export default {
  components: {
    FontAwesomeIcon,
  },
  props: ['validationErrors', 'warnings', 'simulation'],
  data() {
    return {
      simulationMeta: {
        ACTIVE: {
          title: this.$t('Flow not completed'),
          variant: 'warning',
        },
        LOOP: {
          title: this.$t('Flow loop'),
          variant: 'warning',
        },
        COMPLETED: {
          title: this.$t('Flow completed'),
          variant: 'success',
        },
        UNREACHABLE: {
          title: this.$t('Unreachable elements'),
          variant: 'danger',
        },
      },
      simulationOpenedTests: [],
      shouldDisplaySimulationPanel: false,
      shouldDisplayProblemsPanel: false,
      errorColor: '#D9534F',
      warningColor: '#F0AD4E',
      faExclamationTriangle,
      faTimesCircle,
      faChevronUp,
      faChevronDown,
      faCheck,
      faPlus,
      faMinus,
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
    isSimulationPanelDisplayed() {
      return this.shouldDisplaySimulationPanel;
    },
    chevronIcon() {
      return this.shouldDisplayProblemsPanel ? faChevronUp : faChevronDown;
    },
  },
  methods: {
    checkSimulation() {
      this.shouldDisplaySimulationPanel = !this.shouldDisplaySimulationPanel;
      this.simulation.paths.splice(0);
      this.$emit('check-simulation');
    },
    isSimulationTestOpen(index) {
      return this.simulation.selected === index;
    },
    toggleSimulationTest(index) {
      if (this.isSimulationTestOpen(index)) {
        this.simulation.selected = null;
      } else {
        this.simulation.selected = index;
      }
    },
    isErrorCategory(error) {
      return error.category === 'error';
    },
  },
};
</script>
<style lang="scss" src="./validationStatus.scss" scoped />
