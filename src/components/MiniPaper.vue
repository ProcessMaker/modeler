<template>
  <div class="mini-paper-container" @click="movePaper">
    <div v-show="isOpen" ref="miniPaper" class="mini-paper" />
  </div>
</template>

<script>
import { dia } from 'jointjs';

export default {
  data() {
    return {
      miniPaper: null,
    };
  },
  props: {
    isOpen: { type: Boolean },
    paper: { type: Object },
    graph: { type: Object },
  },
  watch: {
    isOpen(isOpen) {
      if (isOpen) {
        this.scaleMiniMapToFitContent();
      }
    },
  },
  methods: {
    scaleMiniMapToFitContent() {
      setTimeout(() => {
        this.miniPaper.scaleContentToFit({ padding: 10, maxScaleX: 0.5, maxScaleY: 0.5 });
      });
    },
    movePaper({ offsetX, offsetY }) {
      const { x, y } = this.miniPaper.paperToLocalPoint(offsetX, offsetY);
      const { sx, sy } = this.paper.scale();
      const { clientWidth, clientHeight } = this.paper.el;

      this.paper.translate(
        (clientWidth / 2) - (x * sx),
        (clientHeight / 2) - (y * sy),
      );
    },
  },
  async mounted() {
    await this.$nextTick();

    this.miniPaper = new dia.Paper({
      el: this.$refs.miniPaper,
      model: this.graph,
      width: 300,
      height: 200,
      interactive: false,
    });

    this.paper.on('render:done', this.scaleMiniMapToFitContent);

    window.ProcessMaker.EventBus.$on('modeler-change', this.scaleMiniMapToFitContent);
  },
  beforeDestroy() {
    this.paper.off('render:done', this.scaleMiniMapToFitContent);
  },
};
</script>

<style lang="scss">
$mini-paper-container-top-position: 2.5rem;
$mini-paper-container-right-position: 0;

.mini-paper-container {
  position: absolute;
  top: $mini-paper-container-top-position;
  right: $mini-paper-container-right-position;
  z-index: 2;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
  border: 1px solid #e9ecef;
  cursor: pointer;

  .mini-paper {
    pointer-events: none;
  }
}
</style>
