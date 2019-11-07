<template>
  <div class="mini-paper-container" @click="movePaper" :class="visibilityClass">
    <div ref="miniPaper" class="mini-paper" />
  </div>
</template>

<script>
import MiniMapManager from './miniMapManager';

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
    visibilityClass() {
      return this.isOpen ? 'visible' : 'invisible';
    },
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

<style lang="scss">
$mini-paper-container-top-position: 1rem;
$mini-paper-container-right-position: 17.5rem;
$mini-paper-container-right-expanded-position: 2rem;

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
.mini-paper-expanded {
  right: $mini-paper-container-right-expanded-position;
}
</style>
