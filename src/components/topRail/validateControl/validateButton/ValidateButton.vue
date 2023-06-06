<template>
  <button
    type="button"
    @click.prevent="handleOpen"
    :class="['validate-button', { 'validate-button-active': isOpen }]"
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
    handleOpen() {
      // Show/hide issue button
      this.isOpen = !this.isOpen;

      this.$emit('openIssue', this.isOpen);
    },
  },
};
</script>

<style scoped lang="scss" src="./validateButton.scss"></style>
