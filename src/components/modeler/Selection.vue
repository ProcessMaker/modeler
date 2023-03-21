<template>
  <div v-if="start && size" class="box" :style="{ left: start.x + 'px', top: start.y + 'px', height: size.height + 'px', width: size.width + 'px' }" />
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
      end: null,
      size: null,
      isSelecting: false,
    };
  },
  computed: {
    boxLeft(){
      return this.options.left;
    },
    boxTop(){
      return this.options.top;
    },
    height(){
      return this.options.height;
    },
    width(){
      return this.options.width;
    },
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
      this.end = {
        x: this.start.x,
        y: this.start.y,
      };
      this.size = {
        height: 0,
        width: 0,
      };
    },
    updateSelection(event, paper) {
      if (this.isSelecting) {
        const nEvent= util.normalizeEvent(event);
        console.log('update selection');

        const paperOffset = paper.$el.offset();
        this.end = {
          x: nEvent.clientX - paperOffset.left + window.pageXOffset + paper.$el.scrollLeft(),
          y: nEvent.clientY - paperOffset.top + window.pageYOffset + paper.$el.scrollTop(),
        };

        // const rect = this.$el.getBoundingClientRect();
        // const start = {
        //   x: Math.min(this.start.x, this.end.x),
        //   y: Math.min(this.start.y, this.end.y),
        // };
        // const end = {
        //   x: Math.max(this.start.x, this.end.x),
        //   y: Math.max(this.start.y, this.end.y),
        // };

        const size ={
          height: this.end.y - this.start.y,
          width: this.end.x - this.start.x,
        };
        this.size = {
          height: size.height,
          width: size.width,
        
        };
        console.log(this.size.height, this.size.width);
      }
    },
    endSelection() {
      console.log('endSelection');
      this.isSelecting = false;
      this.start = null;
      this.end = null;
    },
    isSelected(index) {
      if (!this.start || !this.end) {
        return false;
      }

      const rect = this.$el.getBoundingClientRect();
      const start = {
        x: Math.min(this.start.x, this.end.x) - rect.left,
        y: Math.min(this.start.y, this.end.y) - rect.top,
      };
      const end = {
        x: Math.max(this.start.x, this.end.x) - rect.left,
        y: Math.max(this.start.y, this.end.y) - rect.top,
      };

      const elementRect = this.$el.children[index].getBoundingClientRect();
      const elementPosition = {
        x: elementRect.left - rect.left,
        y: elementRect.top - rect.top,
      };
      const elementSize = {
        width: elementRect.width,
        height: elementRect.height,
      };

      const overlapX = Math.max(
        0,
        Math.min(end.x, elementPosition.x + elementSize.width) -
          Math.max(start.x, elementPosition.x)
      );
      const overlapY = Math.max(
        0,
        Math.min(end.y, elementPosition.y + elementSize.height) -
          Math.max(start.y, elementPosition.y)
      );
      const overlapArea = overlapX * overlapY;

      return overlapArea > 0;
    },
  },
};
</script>

<style>
.box {
  position: absolute;
  border-style: groove;
}
</style>
