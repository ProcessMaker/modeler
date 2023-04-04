<template>
  <div
    ref="drag"
    v-if="showLasso && style"
    class="box"
    data-cy="selection-box"
    :data-length="selected.length"
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
import { labelWidth, poolPadding } from '@/components/nodes/pool/poolSizes';
export default {
  name: 'Selection',
  components: {
    CrownMultiselect,
  },
  props: {
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
      preventDrag: false,
      hideSelectionOnMove: true,
      draggableBlackList: [
        laneId,
      ],
      selectionBlackList:[
        'processmaker-modeler-generic-flow',
      ],
    };
  },
  mounted(){
    this.paperManager.paper.on('scale:changed ', this.updateSelectionBox);
    this.paperManager.paper.on('translate:changed ', this.translateChanged);
    document.addEventListener('keydown', this.shiftKeyDownListener);
    document.addEventListener('keyup', this.shiftKeyUpListener);
  },
  watch: {
    // whenever selected changes
    selected(newSelected) {
      this.addToHighlightedNodes(newSelected);
    },
  },
  methods: {
    async selectElement(view) {
      this.showLasso = true;
      this.isSelected = true;
      this.isSelecting = true;
      this.start = null;
      this.selected = [view];
      await this.$nextTick();
      this.updateSelectionBox();
    },
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
      this.selected = this.getElementsInSelectedArea(selectedArea, { strict: false });
      this.filterSelected();
      if (this.selected && this.selected.length > 0) {
        this.updateSelectionBox();
        this.isSelected = true;
      } else {
        this.clearSelection();
        this.isSelected = false;
        this.start = null;
      }
      this.start = null;
    },
    /**
     * Get elements into a selected area
     * @param {Object} area
     */
    getElementsInSelectedArea(area, options, addLinks=true) {
      const { paper } = this.paperManager;
      // get shapes
      const elements =  paper.findViewsInArea(area, options);
      
      if (!addLinks) {
        return elements;
      }
      // get links
      this.graph.getLinks().forEach(function(link) {
        // Check if the link is intersected with the selected area
        if (area.intersect(link.getBBox())) {
          // The link is intersected with the selected area
          elements.push(paper.findViewByModel(link));
        }
      });
      return elements;
    },
    /**
     * Return the bounding box of the selected elements,
     * @param {Array} selected
     */
    getSelectionVertex(selected, byModel = false, includeAll = false) {
      const point = { x : 1 / 0, y: 1 / 0 };
      const size = { width: 0, height: 0 };
      const useModelGeometry = this.useModelGeometry;
      const shapesToNotTranslate = [
        'PoolLane',
        'standard.Link',
      ];
      selected.filter(shape => includeAll || !shapesToNotTranslate.includes(shape.model.get('type')))
        .map(function(view) {
          const box = byModel ?
            view.model.getBBox({ useModelGeometry }) :
            view.getBBox({ useModelGeometry }).inflate(7);
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
    updateSelectionBox(force=false) {
      if (force || this.isSelecting && this.style) {
        if (this.selected.length > 0) {
          const box = this.getSelectionVertex(this.selected, false, true);
          // Set the position of the element
          this.style.left = `${box.minX}px`;
          this.style.top = `${box.minY}px`;
          this.left = parseInt(this.style.left);
          this.top = parseInt(this.style.top);
          // Set the dimensions of the element
          this.style.width = `${box.maxX - box.minX}px`;
          this.style.height = `${box.maxY - box.minY}px`;
        } else {
          this.clearSelection();
        }
      }
    },
    /**
     * Update the selected box if a user select a element with shift key pressed
     * @param {Object} elementView
     */
    elementClickHandler(elementView ) {
      // verify if element is not black listed 
      if (elementView && elementView.model && elementView.model.component &&
        this.selectionBlackList.includes(elementView.model.component.node.type)) {
        return;
      }
      if (this.shiftKeyPressed) {
        const element = this.selected.find( item => item.id === elementView.id);
        if (element) {
          this.selected = this.selected.filter(item => item.id !== elementView.id);
          this.filterSelected();
        } else {
          this.selected.push(elementView);
          this.filterSelected();
        }
      } else {
        this.selected = [elementView];
      }
      this.isSelecting = true;
      this.isSelected = true;
      this.showLasso = true;
      this.updateSelectionBox();
    },
    filterSelected() {
      // remove from selection the selected child nodes in the pool
      const selectedPoolsIds = this.selected
        .filter(shape => shape.model.component)
        .filter(shape => shape.model.component.node.type === 'processmaker-modeler-pool')
        .map(shape => shape.model.component.node.id);
      this.selected = this.selected.filter(shape => {
        if (shape.model.component && shape.model.component.node.pool) {
          return shape.model.component.node.pool && !selectedPoolsIds.includes(shape.model.component.node.pool.component.node.id);
        }
        return true;
      });
    },
    /**
     * Pan paper handler
     */
    translateChanged() {
      if (this.isSelecting) {
        this.updateSelectionBox();
      }
    },
    /**
    * Verify if has selected lanes
    */
    hasLanes(selected) {
      const shapesToNotTranslate = [
        'processmaker-modeler-lane',
      ];
      const shapes = selected.find(shape => {
        return shapesToNotTranslate.includes(shape.model.component.node.type);
      });
      if (shapes) {
        return true;
      } 
      return false;
    },
    
    /**
     * validate if the selection can be dragged
     */
    canDragTheSelectionBox(selected, draggableBlackList = []) {
      const { paper } = this.paperManager;
      let result = true;
      selected.forEach(shape => {
        if (shape.model.get('type') === 'standard.Link') {
          const source = paper.findViewByModel(shape.model.getSourceElement());
          const foundSource = selected.find(obj => obj.model.get('id') === source.model.get('id'));
          const target = paper.findViewByModel(shape.model.getTargetElement());
          const foundTarget = selected.find(obj => obj.model.get('id') === target.model.get('id'));
          if (foundSource && foundTarget) {
            result = true;
          } else {
            result = false;
          }
        } 
        if (shape.model.component && draggableBlackList.includes(shape.model.component.node.type)) {
          result = false;
        }
        if (shape.model.component && this.selectionBlackList.includes(shape.model.component.node.type)) {
          result = false;
        }
      });
      return result;
    },
    /**
     * Start the drag procedure for the selext box
     * @param {Object} event
     */
    startDrag(event, ref) {
      if (!this.$refs.drag) {
        return;
      }
      this.dragging = true;
      this.preventDrag = false;
      this.hasMouseMoved = false;
      const nEvent= util.normalizeEvent(event);
      this.mouseX = nEvent.clientX;
      this.mouseY = nEvent.clientY;
      this.top = this.$refs.drag.offsetTop;
      this.left = this.$refs.drag.offsetLeft;
      this.initialPosition = {
        top: this.top,
        left: this.left,
      };
      if (ref) {
        this.drafRef = ref;
      } else {
        this.drafRef = null;
      }
      if (this.hasLanes(this.selected)) {
        this.preventDrag = true;
      }
      
      if (!this.canDragTheSelectionBox(this.selected, this.draggableBlackList)) {
        this.hideSelectionOnMove = true;
        this.showLasso = false;
        return;
      }

    },
    /**
     * on Drag procedure
     * @param {*} event
     */
    drag(event) {
      if (this.preventDrag) return;
      if (!this.dragging) return;
      this.hasMouseMoved = true;
      const nEvent= util.normalizeEvent(event);
      const deltaX = nEvent.clientX - this.mouseX;
      const deltaY = nEvent.clientY - this.mouseY;
      this.top += deltaY;
      this.left += deltaX;
      this.mouseX = nEvent.clientX;
      this.mouseY = nEvent.clientY;
      // Set the position of the element
      const scale = this.paperManager.paper.scale();
      this.style.left =`${this.left}px`;
      this.style.top = `${this.top}px`;
      this.translateSelectedShapes(deltaX/scale.sx, deltaY/scale.sy);
      this.overPoolDrag(event);
    },
    /**
     * Stop drag procedure
     * @param {Object} event
     */
    stopDrag() {
      if (!this.hasMouseMoved) {
        this.hasMouseMoved = false;
        if (this.drafRef) {
          this.elementClickHandler(this.drafRef);
          this.drafRef = null;
          return;
        } else {
          this.clearSelection();
          return;
        } 
      }
      if (this.hideSelectionOnMove) {
        this.hideSelectionOnMove = false;
        this.showLasso = true;
        this.updateSelectionBox();
      }
      this.overPoolStopDrag();
      this.$emit('save-state');
      this.dragging = false;
    },
    translateSelectedShapes(x, y, drafRef) {
      const shapesToNotTranslate = [
        'PoolLane',
        'standard.Link',
      ];
      let shapes = this.selected.filter(shape => {
        return !shapesToNotTranslate.includes(shape.model.get('type'));
      });
      if (drafRef) {
        shapes.filter(shape =>{
          return drafRef.model.get('id') !== shape.model.get('id');
        });
      }
      shapes.forEach((shape)=> shape.model.translate(x, y));
    },
    /**
     * Add an element into the highlighted nodes
     */
    addToHighlightedNodes(selected){
      store.commit('highlightNode');
      if (selected.length > 0) {
        const selectedNodes = selected.filter(shape => shape.model.component)
          .map(shape => shape.model.component.node);
        store.commit('addToHighlightedNodes', selectedNodes);
      } else {
        store.commit('highlightNode', this.processNode);
      }
    },
    /**
     * Shift Key Down Handler
     * @param {*} event
     */
    shiftKeyDownListener(event) {
      // check if shift key is pressed without any other key
      if (event.key === 'Shift' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        this.shiftKeyPressed = true;
      }
    },
    /**
     * Shift Key Up Handler
     */
    shiftKeyUpListener({ key }) {
      if (key === 'Shift') {
        this.shiftKeyPressed = false;
      }
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
     * Check that they are not in a pool
     * @param {Array} elements 
     * @return true if there is a pool in the selection or if none of the selected elements are in a pool
     */
    isNotPoolChilds(elements) {
      if (elements.length > 0) {
        const poolInSelection = elements.find(({ model }) => {
          return model.component && model.component.node.type === poolId;
        });
        const elementInAPool = elements.find(({ model }) => {
          return (model.getParentCell() && model.getParentCell().component.node.type === poolId);
        });
        return !!poolInSelection || !elementInAPool;
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
      if (this.hasLanes(this.selected)) {
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
      const shapesToNotTranslate = [
        'PoolLane',
        'standard.Link',
      ];
      this.selected.filter(shape => !shapesToNotTranslate.includes(shape.model.get('type')))
        .forEach(shape => {
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
        const pool = selected.find(({ model }) => {
          if (model.getParentCell()) {
            return model.getParentCell().component.node.type === poolId;
          }
          return false;
        }).model.getParentCell();
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
  pointer-events: none;
}
</style>
