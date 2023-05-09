<template>
  <div class="mini-paper-box">
    <button
      type="button"
      class="mini-paper-button"
      :class="miniMapOpen ? 'mini-paper-button-active' : ''"
      data-test="mini-map-btn"
      @click="miniMapOpen = !miniMapOpen"
      v-b-tooltip.hover
      :title="miniMapOpen ? $t('Hide Mini-Map') : $t('Show Mini-Map')"
    >
      <MiniMapIcon />
    </button>
  </div>
</template>

<script>
import { MiniMapIcon } from '@/components/railBottom/icons';

export default ({
  components: {
    MiniMapIcon,
  },
  miniMapOpen(isOpen) {
    this.$emit('toggle-mini-map-open', isOpen);
  },
  data() {
    return {
      miniMapOpen: false,
    };
  },
});

</script>

<style lang="scss" scoped src="./miniPaperControl.scss"></style>
