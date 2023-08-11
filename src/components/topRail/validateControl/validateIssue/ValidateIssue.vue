<template>
  <button
    type="button"
    :disabled="numberOfErrors === 0"
    @click.prevent="handleOpen"
    class="issue-box"
    data-cy="validate-issue-button"
  >
    <span class="issue-title">Issues</span>

    <span class="issue-badge">{{ numberOfErrors }}</span>

    <span class="issue-icon">
      <inline-svg :src="isOpen ? issueOpenIcon : issueCloseIcon" />
    </span>
  </button>
</template>

<script>
import InlineSvg from 'vue-inline-svg';

export default {
  components: {
    InlineSvg,
  },
  props: {
    numberOfErrors: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isOpen: false,
      issueCloseIcon: require('@/assets/topRail/issue-close.svg'),
      issueOpenIcon: require('@/assets/topRail/issue-open.svg'),
    };
  },
  watch: {
    numberOfErrors(newValue) {
      // Checks the number of errors if it is "0" reset the issue icon
      if (newValue === 0) {
        this.isOpen = false;
      }
    },
  },
  methods: {
    /**
     * Show/hide the issue panel
     */
    handleOpen() {
      this.isOpen = !this.isOpen;

      this.$emit('openPanel', this.isOpen);
    },
  },
};
</script>

<style scoped lang="scss" src="./validateIssue.scss"></style>
