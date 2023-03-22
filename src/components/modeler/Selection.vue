<template>
  <div v-if="isSelecting" class="box" />
</template>

<script>
import { util, g, V } from 'jointjs';
import store from '@/store';
export default {
  name: 'Selection',
  props: {
    options: Object,
    paper: Object,
  },
  data() {
    return {
      start: null,
      isSelecting: false,
    };
  },
  methods: {
    startSelection(event, paper) {
      const nEvent= util.normalizeEvent(event);
      this.isSelecting = true;
      const paperOffset = paper.$el.offset();
      this.start = {
        x: nEvent.clientX - paperOffset.left + window.pageXOffset + paper.$el.scrollLeft(),
        y: nEvent.clientY - paperOffset.top + window.pageYOffset + paper.$el.scrollTop(),
      };
      this._offset = {
        x: nEvent.offsetX,
        y: nEvent.offsetY,
      };
    },

    updateSelection(event, paper) {
      if (this.isSelecting &&  this.start) {
        const nEvent= util.normalizeEvent(event);

        const paperOffset = paper.$el.offset();
        const end = {
          x: nEvent.clientX - paperOffset.left + window.pageXOffset + paper.$el.scrollLeft(),
          y: nEvent.clientY - paperOffset.top + window.pageYOffset + paper.$el.scrollTop(),
        };

        const size = {
          height: end.y - this.start.y,
          width: end.x - this.start.x,
        };
        // Set the position of the element
        this.$el.style.position = 'absolute';
        this.$el.style.left =`${size.width < 0 ? this._offset.x + size.width: this.start.x}px`;
        this.$el.style.top = `${size.height < 0 ? this._offset.y + size.height: this.start.y}px`;

        // Set the dimensions of the element
        this.$el.style.width = `${Math.abs(size.width)}px`;
        this.$el.style.height = `${Math.abs(size.height)}px`;
        
      }
    },
    endSelection(paper) {
      const paperOffset = paper.$el.offset();

      const selectorOffset = {
        left: this.$el.offsetLeft + paperOffset.left,
        top: this.$el.offsetTop + paperOffset.top, 
      };
      let width = this.$el.clientWidth;
      let height = this.$el.clientHeight;

      const f = V(paper.viewport).toLocalPoint(selectorOffset.left, selectorOffset.top);
      f.x -= window.pageXOffset;
      f.y -= window.pageYOffset;
      const scale = paper.scale();
      width /= scale.sx;
      height /= scale.sy;

      let selectedArea = g.rect(f.x, f.y, width, height);
      let selectedNodes = this.getElementsInSelectedArea(selectedArea);
      store.commit('addToHighlightedNodes', selectedNodes);
      console.log(selectedNodes);
      console.log('endSelection');
      this.isSelecting = false;
      this.start = null;

    },
    getElementsInSelectedArea(a) {
      const b = this.paper;
      const c = { strict: false };
      return b.findViewsInArea(a, c);
    },
  },
};
</script>

<style>
.box {
  border: 1px solid #5faaee;
  background:rgba(13, 153, 255, .1);
}
</style>
