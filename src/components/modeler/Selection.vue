<template>
  <div v-if="isSelecting" class="box" />
</template>

<script>
import { util } from 'jointjs';
export default {
  name: 'Selection',
  props: {
    options: Object,
  },
  data() {
    return {
      test: 'test',
      start: null,
      // end: null,
      // size: null,
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
      // this.end = {
      //   x: this.start.x,
      //   y: this.start.y,
      // };
      // this.size = {
      //   height: 0,
      //   width: 0,
      // };
      this._offset = {
        x: nEvent.offsetX,
        y: nEvent.offsetY,
      };
    },

    updateSelection(event, paper) {
      if (this.isSelecting &&  this.start) {
        const nEvent= util.normalizeEvent(event);
        console.log('update selection');

        const paperOffset = paper.$el.offset();
        const end = {
          x: nEvent.clientX - paperOffset.left + window.pageXOffset + paper.$el.scrollLeft(),
          y: nEvent.clientY - paperOffset.top + window.pageYOffset + paper.$el.scrollTop(),
        };

        const size = {
          height: end.y - this.start.y,
          width: end.x - this.start.x,
        };
        console.log(size.height, size.width);
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

      const selectorOffset = {
        left: this.$el.offsetLeft,
        top: this.$el.offsetTop,
      };
      let width = this.$el.clientWidth;
      let height = this.$el.clientHeight;

      console.log(selectorOffset);
      console.log(width);
      console.log(height);
      console.log(paper);
      // const f =paper.toLocalPoint(selectorOffset.left, selectorOffset.top);
      const f = paper.clientToLocalPoint(selectorOffset.left, selectorOffset.top);
      console.log(f);
      f.x -= window.pageXOffset;
      f.y -= window.pageYOffset;
      const scale = paper.scale();
      width /= scale.sx;
      height /= scale.sy;
      // let i = paper.rect(f.x, f.y, width, height);

      // console.log(i);
      console.log('endSelection');
      this.isSelecting = false;
      this.start = null;

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
