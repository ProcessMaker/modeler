<template>
  <div class="top-rail-container">
    <ValidateIssue
      v-show="isOpenIssue"
      :number-of-errors="numberOfErrors"
      @openPanel="handleOpenPanel"
    />

    <ValidateButton @openIssue="handleOpenIssue" />

    <ValidatePanel
      v-show="isOpenIssue && isOpenPanel"
      :error-list="errorList"
      :warnings="warnings"
    />
    <slot />
  </div>
</template>

<script>
import store from '@/store';
import { ValidateButton, ValidateIssue, ValidatePanel } from '@/components/topRail/validateControl';

export default {
  components: {
    ValidateButton,
    ValidateIssue,
    ValidatePanel,
  },
  props: {
    validationErrors: {
      type: Object,
      required: true,
    },
    warnings: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isOpenIssue: false,
      isOpenPanel: false,
    };
  },
  computed: {
    errorList() {
      // Get a formatted error list to show in the issue panel
      return Object.entries(this.validationErrors)
        .flatMap(([errorKey, errors]) => (
          errors.flatMap(error => ({
            ...error,
            errorKey,
            ...{ 'errorId': `${error.id}_${error.message.split(' ').join('_')}` },
          }))
        ));
    },
    numberOfErrors() {
      // Get the number of errors
      return this.errorList.length + this.warnings.length;
    },
  },
  watch: {
    numberOfErrors(newValue) {
      // Checks the number of errors, if it is "0" hides the panel errors
      if (newValue === 0) {
        this.isOpenPanel = false;
      }
    },
  },
  methods: {
    /**
     * Show/hide the issue button
     * @param {boolean} value
     */
    handleOpenIssue(value) {
      this.isOpenIssue = value;
      // Set the auto-validate value store
      store.commit('setAutoValidate', this.isOpenIssue);
    },
    /**
     * Show/hide the issue panel
     * @param {boolean} value
     */
    handleOpenPanel(value) {
      this.isOpenPanel = value;
    },
  },
};
</script>

<style scoped lang="scss" src="./topRail.scss"></style>
