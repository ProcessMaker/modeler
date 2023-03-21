<template>
  <div v-if="start" class="box" />
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
      if (this.isSelecting) {
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
