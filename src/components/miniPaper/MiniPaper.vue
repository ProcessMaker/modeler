<template>
  <div
    class="mini-paper-container"
    @click="movePaper"
    :class="isOpen ? 'opened' : 'closed'"
    data-cy="mini-map-box"
  >
    <div ref="miniPaper" class="mini-paper" />
  </div>
</template>

<script>
import MiniMapManager from '../miniMapManager';

export default {
  data() {
    return {
      miniMapManager: null,
      newX: 0,
      newY: 0,
    };
  },
  props: {
    isOpen: { type: Boolean },
    paperManager: { type: Object },
    graph: { type: Object },
  },
  watch: {
    isOpen(isOpen) {
      if (isOpen) {
        this.miniMapManager.scaleMiniMap();
      }
    },
  },
  computed: {
    miniMap() {
      return this.miniMapManager.miniMap;
    },
  },
  methods: {
    movePaper({ offsetX, offsetY }) {
      const { sx: scaleX, sy: scaleY } = this.paperManager.scale;
      const { clientWidth, clientHeight } = this.paperManager.paper.el;
      const { newX, newY } = this.miniMapManager.calculateNewPaperPosition(offsetX, offsetY, scaleX, scaleY, clientWidth, clientHeight);
      this.newX = newX;
      this.newY = newY;

      this.paperManager.translate(this.newX, this.newY);
    },
  },
  async mounted() {
    if (window.Cypress) {
      window.MiniPaper = this;
    }

    await this.$nextTick();

    this.miniMapManager = MiniMapManager.factory(this.graph, this.$refs.miniPaper);

    this.paperManager.addEventHandler('render:done', this.miniMapManager.scaleMiniMap, this);
    window.ProcessMaker.EventBus.$on('modeler-change', () => this.miniMapManager.scaleMiniMap());

  },
  beforeDestroy() {
    this.paperManager.removeEventHandler('render:done', this.miniMapManager.scaleMiniMap, this);
  },
};
</script>
<style lang="scss" src="./miniPaper.scss" scoped />
