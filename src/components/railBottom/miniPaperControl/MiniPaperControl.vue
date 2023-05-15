<template>
  <div class="mini-paper-box">
    <button
      type="button"
      class="mini-paper-button"
      :class="miniMapOpen ? 'mini-paper-button-active' : ''"
      data-test="mini-map-btn"
      data-cy="mini-paper-button"
      @click="miniMapOpen = !miniMapOpen"
      v-b-tooltip.hover
      :title="miniMapOpen ? $t('Hide Mini-Map') : $t('Show Mini-Map')"
    >
      <MiniMapIcon />
    </button>

    <mini-paper
      :isOpen="miniMapOpen"
      :paperManager="paperManager"
      :graph="graph"
    />
  </div>
</template>

<script>
import { MiniMapIcon } from '@/components/railBottom/icons';
import MiniPaper from '@/components/miniPaper/MiniPaper.vue';

export default ({
  components: {
    MiniMapIcon,
    MiniPaper,
  },
  props: {
    paperManager: Object,
    graph: Object,
  },
  data() {
    return {
      miniMapOpen: false,
    };
  },
});

</script>

<style lang="scss" scoped src="./miniPaperControl.scss"></style>
