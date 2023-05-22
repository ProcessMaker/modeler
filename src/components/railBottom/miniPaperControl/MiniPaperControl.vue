<template>
  <div class="mini-paper-box">
    <button
      type="button"
      class="mini-paper-button"
      :class="miniMapOpen ? 'mini-paper-button-active' : ''"
      data-cy="mini-paper-button"
      @click="miniMapOpen = !miniMapOpen"
      v-b-tooltip.hover
      :title="miniMapOpen ? $t('Hide Mini-Map') : $t('Show Mini-Map')"
    >
      <inline-svg :src="miniMapIcon" />
    </button>

    <mini-paper
      :isOpen="miniMapOpen"
      :paperManager="paperManager"
      :graph="graph"
    />
  </div>
</template>

<script>
import InlineSvg from 'vue-inline-svg';
import MiniPaper from '@/components/miniPaper/MiniPaper.vue';

export default ({
  components: {
    InlineSvg,
    MiniPaper,
  },
  props: {
    paperManager: Object,
    graph: Object,
  },
  data() {
    return {
      miniMapOpen: false,
      miniMapIcon: require('@/assets/railBottom/mini-map.svg'),
    };
  },
});

</script>

<style lang="scss" scoped src="./miniPaperControl.scss"></style>
