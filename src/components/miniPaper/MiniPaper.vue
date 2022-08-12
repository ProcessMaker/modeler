<template>
  <div class="mini-paper-container position-absolute" :class="isOpen ? 'opened' : 'closed'" @click="movePaper">
    <div ref="miniPaper" class="mini-paper" />
  </div>
</template>

<script>
import MiniMapManager from "../miniMapManager";

export default {
  props: {
    isOpen: { type: Boolean },
    paperManager: { type: Object },
    graph: { type: Object }
  },
  data() {
    return {
      miniMapManager: null
    };
  },
  computed: {
    miniMap() {
      return this.miniMapManager.miniMap;
    }
  },
  watch: {
    isOpen(isOpen) {
      if (isOpen) {
        this.miniMapManager.scaleMiniMap();
      }
    }
  },
  async mounted() {
    await this.$nextTick();

    this.miniMapManager = MiniMapManager.factory(this.graph, this.$refs.miniPaper);

    this.paperManager.addEventHandler("render:done", this.miniMapManager.scaleMiniMap, this);
    window.ProcessMaker.EventBus.$on("modeler-change", () => this.miniMapManager.scaleMiniMap());
  },
  beforeDestroy() {
    this.paperManager.removeEventHandler("render:done", this.miniMapManager.scaleMiniMap, this);
  },
  methods: {
    movePaper({ offsetX, offsetY }) {
      const { sx: scaleX, sy: scaleY } = this.paperManager.scale;
      const { clientWidth, clientHeight } = this.paperManager.paper.el;
      const { newX, newY } = this.miniMapManager.calculateNewPaperPosition(offsetX, offsetY, scaleX, scaleY, clientWidth, clientHeight);
      this.paperManager.translate(newX, newY);
    }
  }
};
</script>
<style lang="scss" src="./miniPaper.scss" scoped />
