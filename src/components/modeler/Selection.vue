<template>
  <div
    ref="drag"
    v-if="showLasso && style"
    class="box"
    data-cy="selection-box"
    @mousedown="startDrag"
    :style="style"
  > 
    <crown-multiselect
      :paper="paper"
      :graph="$parent.graph"
      :moddle="$parent.moddle"
      :collaboration="$parent.collaboration"
      :process-node="$parent.processNode"
      :plane-elements="$parent.planeElements"
      :is-rendering="$parent.isRendering"
      :dropdown-data="[]"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import { util, g, V } from 'jointjs';
import store from '@/store';
import CrownMultiselect from '@/components/crown/crownMultiselect/crownMultiselect';

export default {
  name: 'Selection',
  components: {
    CrownMultiselect,
  },
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
      isSelected: false,
      selected: [],
      dragging: false,
      style:  {
        left: '0px',
        top: '0px',
        width: '0px',
        height: '0px',
      },
      mouseX: 0,
      mouseY: 0,
      top: 0,
      left: 0,
      
      hasMouseDown: false,
      hasMouseMoved: false,
      showLasso: false,
      shiftKeyPressed: false,
    };
  },
  mounted(){
    this.paper.on('scale:changed ', this.updateSelectionBox);
    this.paper.on('translate:changed ', this.translateChanged);
    this.paper.on('element:pointerclick', this.selectShiftPressed);
    document.addEventListener('keydown', this.shiftKeyDownListener);
    document.addEventListener('keyup', this.shiftKeyUpListener);
  },
  methods: {
    clearSelection() {
      this.initSelection();
    },
    initSelection(){
      this.isSelecting = false;
      this.start = null;
      this.selected = [];
      this.showLasso = false;
      this.isSelected = false;
      this.style = {
        left: '0px',
        top: '0px',
        width: '0px',
        height: '0px',
      };
    },
    /**
     * Starts the selection box
     * @param {Object} event
     */
    startSelection(event) {
      const { paper } = this.paperManager;
      if (!this.isSelected) {
        const { clientX, clientY, offsetX, offsetY } = util.normalizeEvent(event);
        const paperOffset = paper.$el.offset();
        this.isSelecting = true;
        this.showLasso = true;
        this.start = {
          x: clientX - paperOffset.left + window.pageXOffset + paper.$el.scrollLeft(),
          y: clientY - paperOffset.top + window.pageYOffset + paper.$el.scrollTop(),
        };
        this._offset = { x: offsetX, y: offsetY };
      } else {
        this.clearSelection();
      } 
    },
    /**
     * Updates the selection box
     * @param {Object} event
     */
    updateSelection(event) {
      const { paper } = this.paperManager;
      if (this.isSelecting && !this.isSelected && this.start) {
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
        this.style.left =`${size.width < 0 ? this._offset.x + size.width: this.start.x}px`;
        this.style.top = `${size.height < 0 ? this._offset.y + size.height: this.start.y}px`;
        // Set the dimensions of the element
        this.style.width = `${Math.abs(size.width)}px`;
        this.style.height = `${Math.abs(size.height)}px`;
      }
    },
    /**
     * End the selection box
     */
    endSelection() {
      const { paper } = this.paperManager;
      if (!this.isSelecting || this.isSelected) {
        return;
      }
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
      if (this.selected && this.selected.length > 0) {
        this.updateSelectionBox();
        this. addToHighlightedNodes();
        this.isSelected = true;
        this.start = null;
      } else {
        this.clearSelection();
      }
    },
    /**
     * Get elements into a selected area
     * @param {Object} area 
     */
    getElementsInSelectedArea(area) {
      const { paper } = this.paperManager;
      const options = { strict: false };
      return paper.findViewsInArea(area, options);
    },
    /**
     * Update the selection Box
     */
    updateSelectionBox(){
      if (this.isSelecting && this.style) {
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
        this.style.left = `${point.x}px`;
        this.style.top = `${point.y}px`;
        // Set the dimensions of the element
        this.style.width = `${size.width - point.x}px`;
        this.style.height = `${size.height - point.y}px`;
      }
    },
    /**
     * Update the selected box if a user select a element with shift key pressed 
     * @param {Object} elementView 
     */
    selectShiftPressed(elementView) {
      if (this.isSelecting && elementView && this.shiftKeyPressed){
        const element = this.selected.find( item => item.id === elementView.id);
        if (!element) {
          this.selected.push(elementView);
          this.updateSelectionBox();
          this.addToHighlightedNodes();
        }
      } else {
        this.clearSelection();
        this.removeListeners();
      }
    },
    /**
     * Pan papae handler
     */
    translateChanged() {
      if (this.isSelecting) {
        this.updateSelectionBox();
      }
    },  
    /**
     * Start the drag procedure for the selext box
     * @param {Object} event 
     */
    startDrag(event) {
      this.dragging = true;
      this.hasMouseMoved = false;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      this.top = this.$refs.drag.offsetTop;
      this.left = this.$refs.drag.offsetLeft;

      window.addEventListener('mousemove', this.drag);
      window.addEventListener('mouseup', this.stopDrag);
      
    },
    /**
     * on Drag procedure
     * @param {*} event 
     */
    drag(event) {
      const shapesToNotTranslate = [
        'PoolLane',
      ];
      if (!this.dragging) return;
      this.hasMouseMoved = true;
      const nEvent= util.normalizeEvent(event);
      const deltaX = nEvent.clientX - this.mouseX;
      const deltaY = nEvent.clientY - this.mouseY;
      this.top += deltaY;
      this.left += deltaX;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      // Set the position of the element
      const scale = this.paperManager.paper.scale();
      this.style.left =`${this.left}px`;
      this.style.top = `${this.top}px`;
      
      this.selected.forEach(shape => {
        if (!shape.model.getParentCell() && !shapesToNotTranslate.includes(shape.model.get('type'))){
          shape.model.translate(deltaX/scale.sx, deltaY/scale.sy);
        }
      });
    },
    /**
     * Stop drag procedure
     * @param {Object} event 
     */
    stopDrag(event) {
      if (this.hasMouseMoved) {
        this.hasMouseDown = false;
        
        this.updateSelectionBox();
      } else {
        if (!this.shiftKeyPressed) {
          this.selectShapeInLasso(event);
          this.removeListeners();
        } else {
          this.unselectShapeInLasso(event);
        }
      }
      this.dragging = false;
    },
    /**
     * Gets shape from a point object
     * @param {Object} event 
     */
    getShapesFromPoint(event){
      const nEvent= util.normalizeEvent(event);
      const mouseX = nEvent.clientX;
      const mouseY = nEvent.clientY;
      const point = V(this.paperManager.paper.viewport).toLocalPoint(mouseX, mouseY);
      return this.paperManager.paper.findViewsFromPoint(point);
    },
    /**
     * Select a element that is into the selection box
     * @param {*} event 
     */
    selectShapeInLasso(event){
      const elements = this.getShapesFromPoint(event);
      this.selected = [];

      elements.forEach(shape => {
        this.selected.push(shape);
      });
      const updatedCollection = store.state.highlightedNodes.filter(node => node.type === 'processmaker-modeler-process');
      store.state.highlightedNodes = updatedCollection;
      if (this.selected && this.selected.length > 0) {
        this.updateSelectionBox();
        store.commit('highlightNode', this.selected[0].model.component.node);
        this.clearSelection();
      } else {
        this.clearSelection();
        this.removeListeners();
      }
    },
    /**
     * Unselect an element that is not into the selection box
     * @param {*} event 
     */
    unselectShapeInLasso(event){
      const elements = this.getShapesFromPoint(event);
      if (this.shiftKeyPressed) {
        this.selected = this.selected.filter(item => {
          return !elements.some(otherItem => {
            return item.id === otherItem.id && item.name === otherItem.name;
          });
        });
        if (this.selected.length > 0) {
          this.updateSelectionBox();
        } else {
          this.clearSelection;
        }
        
      }
    },
    /**
     * Add an element into the highlighted nodes
     */
    addToHighlightedNodes(){
      const selectedNodes = this.selected.filter(shape => shape.model.component)
        .map(shape => shape.model.component.node);
      store.commit('addToHighlightedNodes', selectedNodes);
    },
    /**
     * remove window listeners
     */
    removeListeners(){
      window.removeEventListener('mousemove', this.drag);
      window.removeEventListener('mouseup', this.stopDrag);
    },
    /**
     * Shift Key Down Handler
     * @param {*} event 
     */
    shiftKeyDownListener(event) {
      if (event.shiftKey && (event.ctrlKey || event.altKey || event.metaKey)) {
        return;
      }
      if (event.key !== 'Shift' || this.shiftKeyPressed) {
        return;
      }
      this.shiftKeyPressed = true;
    },
    /**
     * Shift Key Up Handler
     */
    shiftKeyUpListener({ key }) {
      if (key !== 'Shift' || !this.shiftKeyPressed) {
        return;
      }
      this.shiftKeyPressed = false;
    },
  },
};
</script>

<style>
.box {
  border: 1px solid #5faaee;
  position: absolute;
}
</style>
