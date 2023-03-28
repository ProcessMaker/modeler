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
      :paper="paperManager.paper"
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
import { id as poolId } from '@/components/nodes/pool/config';
import { id as laneId } from '@/components/nodes/poolLane/config';
import { labelWidth, poolPadding } from '../nodes/pool/poolSizes';
export default {
  name: 'Selection',
  components: {
    CrownMultiselect,
  },
  props: {
    options: Object,
    graph: Object,
    paperManager: Object,
    useModelGeometry: Boolean,
    processNode: Object,
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
      initialPosition: null,
      hasMouseDown: false,
      hasMouseMoved: false,
      showLasso: false,
      shiftKeyPressed: false,
      isOutOfThePool: false,
    };
  },
  mounted(){
    this.paperManager.paper.on('scale:changed ', this.updateSelectionBox);
    this.paperManager.paper.on('translate:changed ', this.translateChanged);
    this.paperManager.paper.on('element:pointerclick', this.elementClickHandler);
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
      const { clientX, clientY, offsetX, offsetY } = util.normalizeEvent(event);
      const paperOffset = paper.$el.offset();
      this.clearSelection();
      this.isSelecting = true;
      this.showLasso = true;
      this.start = {
        x: clientX - paperOffset.left + window.pageXOffset + paper.$el.scrollLeft(),
        y: clientY - paperOffset.top + window.pageYOffset + paper.$el.scrollTop(),
      };
      this._offset = { x: offsetX, y: offsetY };
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
      this.selected= this.getElementsInSelectedArea(selectedArea, { strict: false });
      if (this.selected && this.selected.length > 0) {
        this.updateSelectionBox();
        this.isSelected = true;
      } else {
        this.clearSelection();
        this.isSelected = false;
        this.start = null;
      }
      this.start = null;
      this.addToHighlightedNodes();

    },
    /**
     * Get elements into a selected area
     * @param {Object} area 
     */
    getElementsInSelectedArea(area, options) {
      const { paper } = this.paperManager;
      return paper.findViewsInArea(area, options);
    },
    /**
     * Return the bounding box of the selected elements,
     * @param {Array} selected 
     */
    getSelectionVertex(selected, byModel = false) {
      const point = { x : 1 / 0, y: 1 / 0 };
      const size = { width: 0, height: 0 };
      const useModelGeometry = this.useModelGeometry;
      selected.map(function(view) {
        const box = byModel ?
          view.model.getBBox({ useModelGeometry }) :
          view.getBBox({ useModelGeometry }).inflate(4);
        point.x = Math.min(point.x, box.x);
        point.y = Math.min(point.y, box.y);
        size.width = Math.max(size.width, box.x + box.width);
        size.height= Math.max(size.height, box.y + box.height);
      });
      return {
        minX: point.x,
        minY: point.y,
        maxX: size.width,
        maxY: size.height,
      };
    },
    /**
     * Update the selection Box
     */
    updateSelectionBox() {
      if (this.isSelecting && this.style) {
        const box = this.getSelectionVertex(this.selected);
        // Set the position of the element
        this.style.left = `${box.minX}px`;
        this.style.top = `${box.minY}px`;
        // Set the dimensions of the element
        this.style.width = `${box.maxX - box.minX}px`;
        this.style.height = `${box.maxY - box.minY}px`;
      }
    },
    /**
     * Update the selected box if a user select a element with shift key pressed 
     * @param {Object} elementView 
     */
    elementClickHandler(elementView) {
      if (this.shiftKeyPressed) {
        const element = this.selected.find( item => item.id === elementView.id);
        if (!element) {
          this.selected.push(elementView);
          this.addToHighlightedNodes();
        }
      } else {
        this.selected = [elementView];
        store.commit('highlightNode', this.selected[0].model.component.node);
      }
      this.isSelecting = true;
      this.isSelected = true;
      this.showLasso = true;
      this.updateSelectionBox();
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
      this.initialPosition = {
        top: this.top,
        left: this.left,
      },
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
        if (!shapesToNotTranslate.includes(shape.model.get('type'))) {
          shape.model.translate(deltaX/scale.sx, deltaY/scale.sy);
        }
      });
      this.overPoolDrag(event);
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
      this.overPoolStopDrag();
      this.$emit('save-state');
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
    selectShapeInLasso(event) {
      const element = this.getNotEmbeddedShape(event);
      this.selected = [];
      if (element) { 
        this.selected = [element];
      }
      if (this.selected && this.selected.length > 0) {
        this.updateSelectionBox();
        store.commit('highlightNode', this.selected[0].model.component.node);
      } else {
        this.clearSelection();
        this.removeListeners();
        store.commit('highlightNode', this.processNode);
      }
    },
    /**
     * Unselect an element that is not into the selection box
     * @param {Object} event 
     */
    unselectShapeInLasso(event){
      const elements = this.getShapesFromPoint(event);
      if (this.shiftKeyPressed && elements) {
        store.commit('highlightNode', this.processNode);
        this.selected = this.selected.filter(item => {
          return !elements.some(otherItem => {
            return item.id === otherItem.id && item.name === otherItem.name;
          });
        });
        if (this.selected.length > 0) {
          this. updateSelectionBox();
          this.addToHighlightedNodes();
        } else {
          this.clearSelection();
        }
      }
    },
    /**
     * Add an element into the highlighted nodes
     */
    addToHighlightedNodes(){
      store.commit('highlightNode');
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
    /**
     * Gets the not embedded shape
     * @param {object} point 
     */
    getNotEmbeddedShape(point){
      let result = null;
      const views = this.getShapesFromPoint(point);
      views.forEach(shape => {
        if (shape.model.getEmbeddedCells().length === 0){
          result = shape;
        } 
      });
      return result;
    },
    /**
     * Get the elements that are inside the selector box
     */
    getElementsInsideSelector() {
      const { paper } = this.paperManager;
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
      return this.getElementsInSelectedArea(selectedArea, { strict: false });
    },
    /**
     * Check that they are not in a pool
     * @param {Array} elements 
     */
    isNotPoolChilds(elements) {
      if (elements.length > 0) {
        const model = elements[0].model;
        return !(model.component &&
          model.component.node.type !== laneId &&
          model.getParentCell() && model.getParentCell().component.node.type === poolId);
      }
      return false;
    },
    /**
     * Movement controller of the elements that are inside a pool
     */
    overPoolDrag(event) {
      if (this.isNotPoolChilds(this.selected)) {
        return;
      }
      const elementsUnderDivArea = this.getShapesFromPoint(event);
      const pool = elementsUnderDivArea.find(item => {
        return item.model.component && item.model.component.node.type === poolId;
      });
      if (!pool) {
        this.isOutOfThePool = true;
        store.commit('preventSavingElementPosition');
        this.paperManager.setStateInvalid();
      } else {
        this.isOutOfThePool = false;
        store.commit('preventSavingElementPosition');
        this.paperManager.setStateValid();
      }
    },
    /**
     * Stop dragging elements that are in a pool
     */
    overPoolStopDrag(){
      if (this.isNotPoolChilds(this.selected)) {
        return;
      }
      if (this.isOutOfThePool) {
        this.rollbackSelection();
      } else {
        this.expandToFitElement(this.selected);
      }
    },
    /**
     * Rollback drag an element outside it's pool parent
     */
    rollbackSelection(){
      const deltaX = this.initialPosition.left  - this.left;
      const deltaY = this.initialPosition.top - this.top;
      this.style.left = `${this.initialPosition.left}px`;
      this.style.top = `${this.initialPosition.top}px`;
      const scale = this.paperManager.paper.scale();
      this.selected.forEach(shape => {
        shape.model.translate(deltaX/scale.sx, deltaY/scale.sy);
      });
      this.isOutOfThePool = false;
      store.commit('allowSavingElementPosition');
      this.paperManager.setStateValid();
    },
    /**
     * Expand and fit the pool container
     */
    expandToFitElement(selected) {
      if (selected.length > 0) {
        const model = selected[0].model;
        const pool = model.getParentCell();
        const selectionBBox = this.getSelectionVertex(this.selected, true);
        const { x: poolX, y: poolY, width, height } = pool.getBBox();

        const elementWidth = selectionBBox.maxX - selectionBBox.minX;
        const elementHeight = selectionBBox.maxY - selectionBBox.minY;
       
        const relativeX = selectionBBox.minX - poolX;
        const relativeY = selectionBBox.minY  - poolY;

        const rightEdge = relativeX + elementWidth;
        const leftEdge = relativeX;
        const topEdge = relativeY;
        const bottomEdge = relativeY + elementHeight;

        let newWidth = 0;
        let newHeight = 0;
        let directionHeight = 'bottom';
        let directionWidth = 'right';

        if (rightEdge > width - poolPadding) {
          newWidth = rightEdge + poolPadding;
        }

        if (leftEdge < labelWidth + poolPadding) {
          newWidth = width + ((labelWidth + poolPadding) - leftEdge);
          directionWidth = 'left';
        }

        if (topEdge < poolPadding) {
          newHeight = (poolPadding - topEdge) + height;
          directionHeight = 'top';
        }

        if (bottomEdge > height) {
          newHeight = bottomEdge + poolPadding;
        }
        if (newWidth || newHeight) {
          pool.resize(Math.max(newWidth, width), Math.max(newHeight, height), {
            direction: `${directionHeight}-${directionWidth}`,
          });

          pool.component.fixResizeRounding();
          if (pool.component.laneSet) {
            /* Expand any lanes within the pool */
            pool.component.resizeLanes();

            pool.component.sortedLanes().forEach(laneShape => {
              store.commit('updateNodeBounds', {
                node: laneShape.component.node,
                bounds: laneShape.getBBox(),
              });
            });
          }
          pool.component.updateAnchorPointPosition();
          store.commit('updateNodeBounds', {
            node: pool.component.node,
            bounds: pool.getBBox(),
          });
          this.$emit('save-state');
        } 

      }
    },

  },
};
</script>

<style scoped>
.box {
  border: 1px solid #5faaee;
  position: absolute;
}
</style>