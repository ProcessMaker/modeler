<template>
  <div class="top-rail-container">
    <MultiplayerViewUsers :players="players"/>
    <ValidateIssue
      v-show="isOpenIssue"
      :number-of-errors="numberOfErrors"
      @openPanel="handleOpenPanel"
    />

    <AiGenerateButton
      v-if="isPackageAiInstalled"
      v-on="$listeners"
    />

    <ValidateButton @openIssue="handleOpenIssue" />

    <ValidatePanel
      v-show="isOpenIssue && isOpenPanel"
      :error-list="errorList"
      :warnings="warnings"
    />
    <slot />

    <LaunchpadButton @verifyLaunchpad="handleVerifyLaunchpad"/>
    <LaunchpadModal :show="showLaunchpadModal" @closeModal="closeModal" />

  </div>
</template>

<script>
import store from '@/store';
import { ValidateButton, ValidateIssue, ValidatePanel } from '@/components/topRail/validateControl';
import MultiplayerViewUsers from '@/components/topRail/multiplayerViewUsers/MultiplayerViewUsers';
import AiGenerateButton from '../aiMessages/AiGenerateButton.vue';
import { LaunchpadButton, LaunchpadModal } from './launchpadControl';

export default {
  components: {
    ValidateButton,
    ValidateIssue,
    ValidatePanel,
    AiGenerateButton,
    MultiplayerViewUsers,
    LaunchpadButton,
    LaunchpadModal,
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
    players: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      isOpenIssue: false,
      isOpenPanel: false,
      showLaunchpadModal: false,
      openLaunchpad: false,
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
    isPackageAiInstalled() {
      return window.ProcessMaker?.modeler?.isPackageAiInstalled;
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
    handleVerifyLaunchpad(value) {
      this.openLaunchpad = value;
      if (this.openLaunchpad || window.ProcessMaker.modeler.isPublished === false) {
        this.showLaunchpadModal = true;
      } else {
        this.openLaunchpad = false;
        window.location.href = '/process-browser/' + window.ProcessMaker.modeler.process.id;
      }
    },
    closeModal() {
      this.showLaunchpadModal = false;
    },
  },
};
</script>

<style scoped lang="scss" src="./topRail.scss"></style>
