<template>
  <div class="mini-paper-container position-absolute" @click="movePaper" :class="isOpen ? 'opened' : 'closed'">
    <div ref="miniPaper" class="mini-paper" />
  </div>
</template>

<script>
import MiniMapManager from '../miniMapManager';

export default {
  data() {
    return {
      miniMapManager: null,
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
      this.paperManager.translate(newX, newY);
    },
  },
  async mounted() {
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
