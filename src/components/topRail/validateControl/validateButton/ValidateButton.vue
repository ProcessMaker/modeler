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
  props: ['isOpen', 'handleOpen'],
  data() {
    return {
      validateCloseIcon: require('@/assets/topRail/validate-close.svg'),
      validateOpenIcon: require('@/assets/topRail/validate-open.svg'),
    };
  },
};
</script>

<style scoped lang="scss" src="./validateButton.scss"></style>
