<template>
  <div class="pan-tool-box">
    <button type="button" class="pan-tool-button" :class="panMode ? 'pan-tool-button-active' : ''"
      data-cy="pan-button" @click="$emit('set-pan-mode', !panMode)" v-b-tooltip.hover
      :title="$t('Pan Tool')"
    >
      <inline-svg :src="icon" />
    </button>
  </div>
</template>

<script>
import InlineSvg from 'vue-inline-svg';
export default {
  components: {
    InlineSvg,
  },
  props: {
    panMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      icon: require('@/assets/railBottom/pan-icon.svg'),
    };
  },
};
</script>
<style lang="scss" scoped src="./bottomLeftControl.scss"></style>

<style lang="scss" scoped>
.pan-tool-box {
  margin-left: 1em;
  overflow: hidden;
}
</style>