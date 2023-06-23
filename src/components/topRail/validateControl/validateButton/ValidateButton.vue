<template>
  <button
    type="button"
    @click.prevent="handleOpen"
    :class="['validate-button', { 'validate-button-active': isOpen }]"
    data-cy="validate-button"
  >
    <inline-svg :src="isOpen ? validateOpenIcon : validateCloseIcon" />
  </button>
</template>

<script>
import InlineSvg from 'vue-inline-svg';

export default {
  components: {
    InlineSvg,
  },
  data() {
    return {
      isOpen: false,
      validateCloseIcon: require('@/assets/topRail/validate-close.svg'),
      validateOpenIcon: require('@/assets/topRail/validate-open.svg'),
    };
  },
  methods: {
    /**
     * Show/hide issue button
     */
    handleOpen() {
      this.isOpen = !this.isOpen;

      this.$emit('openIssue', this.isOpen);
    },
  },
};
</script>

<style scoped lang="scss" src="./validateButton.scss"></style>
