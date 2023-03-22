<template>
  <div v-if="isSelecting" class="box" @mouseover="handleMouseOver"/>
</template>

<script>
import { util, g, V } from 'jointjs';
import store from '@/store';

export default {
  name: 'Selection',
  props: {
    options: Object,
    paper: Object,
    paperManager: Object,
    useModelGeometry: Boolean,
  },
  data() {
    return {
      start: null,
      isSelecting: false,
      selected: [],
    };
  },
  mounted(){
    this.paper.on('scale:changed ', this.updateSelectionBox);
    this.paper.on('element:pointerclick', this.selectOrUnselectItem);
  },
  methods: {
    initSelection(){
      this.isSelecting = false;
      this.selected = [];
      this.start = null;
    },
    startSelection(event, paper) {
      const nEvent= util.normalizeEvent(event);
      this.isSelecting = true;
      store.commit('highlightNode');
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
      this.selected= this.getElementsInSelectedArea(selectedArea);

      const selectedNodes = this.selected.filter(shape => shape.model.component)
        .map(shape => shape.model.component.node);
      store.commit('addToHighlightedNodes', selectedNodes);
      if (this.selected && this.selected.length > 0) {
        this.updateSelectionBox();
      } else {
        this.isSelecting = false;
      }
      this.start = null;  
    },
    getElementsInSelectedArea(a) {
      const b = this.paper;
      const c = { strict: false };
      return b.findViewsInArea(a, c);
    },
    updateSelectionBox(){
      if (this.isSelecting) {
        debugger;
        const point = { x : 1 / 0, y: 1 / 0 };
        const size = { width: 0, height: 0 };
        const useModelGeometry = this.useModelGeometry;
        this.selected.map(function(view) {
          const box = view.getBBox({
            useModelGeometry,
          });
          
          point.x = Math.min(point.x, box.x);
          point.y = Math.min(point.y, box.y);
          size.width = Math.max(size.width, box.x + box.width);
          size.height= Math.max(size.height, box.y + box.height);
        });
        // Set the position of the element
        this.$el.style.left =`${point.x}px`;
        this.$el.style.top = `${point.y}px`;

        // Set the dimensions of the element
        this.$el.style.width = `${size.width - point.x}px`;
        this.$el.style.height = `${size.height - point.y}px`;

      }
     
    },
    selectOrUnselectItem(elementView){
      console.log('addToSelection');
      if (this.isSelecting && elementView) {
        const element = this.selected.find( item => item.id === elementView.id);
        if (!element) {
          this.selected.push(elementView);
        } else {
          this.selected = this.selected.filter(item => item.id !== elementView.id);
        }
        // last we need update the selection box
        this.updateSelectionBox();
      }

    },
    handleMouseOver(event){
      console.log('handleMouseOver');
      console.log(event);
    },
  },
};
</script>

<style>
.box {
  border: 1px solid #5faaee;
  pointer-events: none;
  /* background:rgba(13, 153, 255, .1); */
}
</style>
