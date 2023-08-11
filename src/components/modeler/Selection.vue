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
      @save-state="$emit('save-state')"
      :has-pools="hasPoolsOrLanesSelected"
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
import { id as genericFlowId } from '@/components/nodes/genericFlow/config';
import { id as sequenceFlowId } from '@/components/nodes/sequenceFlow';
import { id as associationId } from '@/components/nodes/association';
import { id as messageFlowId } from '@/components/nodes/messageFlow/config';
import { id as dataOutputAssociationFlowId } from '@/components/nodes/dataOutputAssociation/config';
import { id as dataInputAssociationFlowId } from '@/components/nodes/dataInputAssociation/config';
import { labelWidth, poolPadding } from '../nodes/pool/poolSizes';
import { invalidNodeColor, poolColor } from '@/components/nodeColors';

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
      conectedLinks:[],
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
      isOutOfThePool: false,
      stopForceMove: false,
      draggableBlackList: [
        laneId,
      ],
      selectionBlackList:[
        genericFlowId,
      ],
      selectableBlackList:[
        genericFlowId,
      ],
      newPool: null,
      oldPool: null,
      isValidSelectionLinks: true,
      invalidPool: null,
    };
  },
  mounted(){
    this.paperManager.paper.on('scale:changed ', this.updateSelectionBox);
    this.paperManager.paper.on('translate:changed ', this.translateChanged);
  },
  computed: {
    hasPoolsOrLanesSelected() {
      return this.selected.some((view) => {
        return view.model.component.node.type === poolId ||
        view.model.component.node.type === laneId;
      });
    },
  },
  watch: {
    // whenever selected changes
    selected(newSelected) {
      this.prepareConectedLinks(newSelected);
      this.addToHighlightedNodes(newSelected);
    },
  },
  methods: {
    async selectElements(elements) {
      await this.$nextTick();
      this.clearSelection();
      this.selected = elements;
      this.showLasso = true;
      this.isSelected = true;
      this.isSelecting = true;
      this.start = null;
      await this.$nextTick();
      this.updateSelectionBox();
    },
    /**
     * Select an element dinamically.
     * Shift key will manage the condition to push to selection
     * @param {Object} view
     * @param {Boolean} shiftKey
     */
    async selectElement(view, shiftKey = false) {
      if (view.model.component && this.selectableBlackList.includes(view.model.component.node.type)) {
        return;
      }
      this.showLasso = true;
      this.isSelected = true;
      this.isSelecting = true;
      this.start = null;
      if (shiftKey) {
        this.shiftKeySelectionHandler(view);
      } else {
        this.selected = [view];
      }
      this.filterSelected();
      await this.$nextTick();
      if (store.getters.isReadOnly === false) {
        this.updateSelectionBox();
      }
    },
    /**
     * Select or unselect an element with shift key pressed
     * @param {Object} view
     */
    shiftKeySelectionHandler(view){
      // validate if current shape is black listed
      if (view && view.model && view.model.component &&
        this.draggableBlackList.includes(view.model.component.node.type)) {
        return;
      }
      // validate if there is a lane previously selected
      let lane = this.selected.find(shape => {
        return this.draggableBlackList.includes(shape.model.component.node.type);
      });
      if (lane) {
        this.selected = [view];
        return;
      }
      // validate if there is a lane previously selected
      let pool = this.selected.find(shape => {
        return shape.model.component.node.type === poolId;
      });
      if (pool && view.model.component.node.type !== poolId) {
        this.selected = [view];
        return;
      }
      // validate if the current selection is a pool
      if (view.model.component && view.model.component.node.type === poolId) {
        //validate if previous selection are all pools
        if (this.hasOnlyPools(this.selected)) {
          this.selectOrUnselectShape(view);
        } else {
          this.selected = [view];
        }
        return;
      }
      // prevent select out of the current pool container
      if (view.model.component && view.model.component.node.pool){
        pool = this.getPool(this.selected);
        if (pool && view.model.component.node.pool.id !== pool.model.get('id')) {
          this.selected = [view];
          return;
        }
      }
      this.selectOrUnselectShape(view);
    },
    /**
     * Select an shape if it is not in the collection
     * Unselect an shape if it is in the collection
     */
    selectOrUnselectShape(view){
      const element = this.selected.find( item => item.id === view.id);
      if (element) {
        this.selected = this.selected.filter(item => item.id !== view.id);
      } else {
        this.selected.push(view);
      }
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
      const elements =  paper.findViewsInArea(area, options);

      if (!addLinks) {
        return elements;
      }
      // get flows
      this.graph.getLinks().forEach(function(link) {
        // Check if the link is within the selected area
        if (area.intersect(link.getBBox())) {
          // The link is within the selected area
          // Do something with the link, such as highlighting it
          elements.push(paper.findViewByModel(link));
        }
      });
      return elements;
    },
    /**
     * Check if a point is into the area
     * @param {Object} position
     * @param {Object} area
     */
    isPositionWithinArea(position, area) {
      const { x, y, width, height } = area;
      return (
        position.x >= x &&
        position.x <= x + width &&
        position.y >= y &&
        position.y <= y + height
      );
    },
    /**
     * Prepare the conectedLinks collection
     * @param {Array} shapes
     */
    prepareConectedLinks(shapes){
      const { paper } = this.paperManager;
      this.conectedLinks = [];
      this.isValidSelectionLinks = true;
      shapes.forEach((shape) => {
        let conectedLinks = this.graph.getConnectedLinks(shape.model);
        // if the shape is a container
        if ( shape.model.component && shape.model.component.node.type === poolId) {
          const area = shape.model.getBBox();
          const linksInArea = paper.model.getLinks().filter((link) => {
            const sourcePosition = link.getSourcePoint();
            const targetPosition = link.getTargetPoint();
            return (
              this.isPositionWithinArea(sourcePosition, area) ||
              this.isPositionWithinArea(targetPosition, area)
            );
          });
          if (linksInArea) {
            conectedLinks = [...conectedLinks, ...linksInArea];
          }
        }
        conectedLinks.forEach((link) => {
          const linkView = paper.findViewByModel(link);
          if (!this.conectedLinks.some(obj => obj.id === linkView.id)) {
            this.conectedLinks.push(linkView);
            this.validateSelectionLinks(linkView);
          }
        });
      });
    },
    /**
     * Validate if the selection is valid to drag and drop in other container
     * @param {Object} linkView
     */
    validateSelectionLinks(linkView){
      if (this.isValidSelectionLinks) {
        const source = this.selected.find(shape => {
          return shape.model.get('id') === linkView.model.getSourceElement().get('id');
        });
        const target = this.selected.find(shape => {
          return shape.model.get('id') === linkView.model.getTargetElement().get('id');
        });
        if (source && target) {
          this.isValidSelectionLinks = true;
        } else {
          this.isValidSelectionLinks = false;
        }
      }
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
    updateSelectionBox(force=false, clearIfEmpty=true) {
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
        } else if (clearIfEmpty) {
          this.clearSelection();
        }
      }
    },
    /**
     * Filter the selected elements
     */
    filterSelected() {
      const flowTypes = [
        sequenceFlowId,
        dataOutputAssociationFlowId,
        dataInputAssociationFlowId,
        associationId,
        messageFlowId,
      ];
      // Get the selected pools IDs
      const selectedPoolsIds = this.selected
        .filter(shape => shape.model.component)
        .filter(shape => shape.model.component.node.type === 'processmaker-modeler-pool')
        .map(shape => shape.model.component.node.id);
      // remove from selection the selected children that belongs to a selected pool
      this.selected = this.selected.filter(shape => {
        if (shape.model.component && shape.model.component.node.pool) {
          return shape.model.component.node.pool && !selectedPoolsIds.includes(shape.model.component.node.pool.component.node.id);
        }
        // remove from selection the selected flows that belongs to a selected pools
        if (shape.model.component  && flowTypes.includes(shape.model.component.node.type)) {
          const parent = shape.model.getParentCell();
          if (parent.component && parent.component.node.pool) {
            return !selectedPoolsIds.includes(parent.component.node.pool.component.node.id);
          }
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
     * Verify if has only flows
     */
    hasOnlyLinks(selected) {
      let shapes = this.selected.filter(shape => {
        return shape.model.get('type') === 'standard.Link';
      });
      return shapes && selected.length === shapes.length;
    },
    /**
     * Verify if has selected one Pools
     */
    hasOnlyPools(selected) {
      let shapes = this.selected.filter(shape => {
        return shape.model.component && shape.model.component.node.type === poolId;
      });
      return shapes && selected.length === shapes.length;
    },
    /**
     * Start the drag procedure for the select box
     * @param {Object} event
     */
    startDrag(event) {
      if (!this.$refs.drag){
        return;
      }
      this.stopForceMove = false;
      this.dragging = true;
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
      if (this.hasLanes(this.selected)) {
        this.stopForceMove = true;
        return;
      }
      if (this.hasOnlyLinks(this.selected)) {
        this.stopForceMove = true;
        return;
      }
      if (this.selected && this.selected.length === 1 &&
        this.selected[0].model.get('type') === 'processmaker.components.nodes.boundaryEvent.Shape') {
        this.selected[0].model.component.attachToValidTarget(this.selected[0]);
      }
    },
    /**
     * on Drag procedure
     * @param {*} event
     */
    drag(event) {
      if (this.stopForceMove) return;
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
    async stopDrag() {
      this.dragging = false;
      this.stopForceMove = false;
      // Readjusts the selection box, taking into consideration elements
      // that are anchored and did not move, such as boundary events.
      await this.$nextTick();
      await this.paperManager.awaitScheduledUpdates();
      this.overPoolStopDrag();
      this.updateSelectionBox();
    },
    /**
     * Selector will update the waypoints of the related flows
     */
    updateFlowsWaypoint(){
      this.conectedLinks.forEach((link)=> {
        if (link.model.component && link.model.get('type') === 'standard.Link'){
          const start = link.sourceAnchor;
          const end = link.targetAnchor;
          link.model.component.node.diagram.waypoint = [start,
            ...link.model.component.shape.vertices(),
            end].map(point => link.model.component.moddle.create('dc:Point', point));
        }
      });
    },
    /**
     * Translate the Selected shapes adding some custom validations
     */
    translateSelectedShapes(x, y, drafRef) {
      const shapesToNotTranslate = [
        'PoolLane',
        'standard.Link',
        'processmaker.components.nodes.boundaryEvent.Shape',
      ];
      let shapes = this.selected.filter(shape => {
        return !shapesToNotTranslate.includes(shape.model.get('type'));
      });
      if (drafRef) {
        shapes.filter(shape =>{
          return drafRef.model.get('id') !== shape.model.get('id');
        });
      }
      // allow movements only if one boundary event is selected;
      if (this.selected && this.selected.length === 1 &&
        this.selected[0].model.get('type') === 'processmaker.components.nodes.boundaryEvent.Shape') {
        this.selected[0].model.translate(x, y);
        // validation about boundary event movements
        this.selected[0].model.component.turnInvalidTargetRed();
        return;
      }
      shapes.forEach((shape)=> shape.model.translate(x, y));
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
     * Gets the child shape
     * @param {object} point
     */
    getChildShape(point) {
      let result = null;
      const views = this.getShapesFromPoint(point);
      if (views.length === 1 ) {
        return views[0];
      }
      views.forEach(shape => {
        if (shape.model.get('parent') && shape.model.component.node.type !== laneId) {
          result = shape;
        }
      });
      return result;
    },
    /**
     * Mark a shape as selected
     * @param {object} point
     */
    markSelectedByPoint(point) {
      const element = this.getChildShape(point);
      if (element) {
        this.selected = [element];
      }
      if (this.selected.length > 0) {
        this.isSelected = true;
        this.isSelecting = true;
        this.showLasso = true;
        this.updateSelectionBox();
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
    getPool(elements){
      const { paper } = this.paperManager;
      let pool = null;
      if (elements && elements.length > 0) {
        elements.forEach(({ model }) => {
          if (pool) {
            return;
          }
          if (model.getParentCell() && model.getParentCell().component.node.type === poolId){
            pool = model.getParentCell();
          }
        });
      }
      return paper.findViewByModel(pool);
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
      const currentPool = this.getPool(this.selected);
      const elementsUnderDivArea = this.getShapesFromPoint(event);
      const pool = elementsUnderDivArea.find(item => {
        return item.model.component && item.model.component.node.type === poolId;
      });
      this.newPool = null;
      this.oldPool = null;
      if (!pool) {
        this.isOutOfThePool = true;
        store.commit('preventSavingElementPosition');
        this.paperManager.setStateInvalid();
      } else {
        this.paperManager.setStateValid();

        if (this.invalidPool) {
          this.invalidPool.model.component.shape.attr('body/fill', poolColor);
          this.invalidPool = null;
        }
        if (currentPool && currentPool.model.get('id') !== pool.model.get('id')) {
          this.newPool = pool;
          this.oldPool = currentPool;
          this.isOutOfThePool = false;
          if (!this.isValidSelectionLinks){
            this.isOutOfThePool = true;
            this.invalidPool = pool;
            pool.model.component.shape.attr('body/fill', invalidNodeColor);
            store.commit('preventSavingElementPosition');
          }
        }
      }
    },
    /**
     * Stop dragging elements that are in a pool
     */
    async overPoolStopDrag(){
      if (this.isNotPoolChilds(this.selected)) {
        this.updateFlowsWaypoint();
        this.$emit('save-state');
        return;
      }
      if (this.isOutOfThePool) {
        this.rollbackSelection();
        if (this.invalidPool) {
          this.invalidPool.model.component.shape.attr('body/fill', poolColor);
          this.invalidPool = null;
        }
      } else {
        this.updateFlowsWaypoint();
        if (this.newPool){
          /* Remove the shape from its current pool */
          this.moveElements(this.selected, this.oldPool, this.newPool);
          this.moveConectedLinks(this.conectedLinks, this.oldPool, this.newPool);
          this.newPool = null;
          this.oldPool = null;
          this.updateLaneChildren(this.selected);
          this.$emit('save-state');
        } else {
          this.expandToFitElement(this.selected);
          this.updateLaneChildren(this.selected);
          this.$emit('save-state');
        }

      }
    },
    /**
     * Rollback drag an element outside it's pool parent
     */
    async rollbackSelection(){
      const deltaX = this.initialPosition.left  - this.left;
      const deltaY = this.initialPosition.top - this.top;
      this.style.left = `${this.initialPosition.left}px`;
      this.style.top = `${this.initialPosition.top}px`;
      const scale = this.paperManager.paper.scale();
      const shapesToNotTranslate = [
        'PoolLane',
        'standard.Link',
        'processmaker.components.nodes.boundaryEvent.Shape',
      ];
      this.selected.filter(shape => !shapesToNotTranslate.includes(shape.model.get('type')))
        .forEach(shape => {
          shape.model.translate(deltaX/scale.sx, deltaY/scale.sy);
        });
      this.isOutOfThePool = false;
      await store.commit('allowSavingElementPosition');
      this.paperManager.setStateValid();
      await this.$nextTick();
      await this.paperManager.awaitScheduledUpdates();
      this.updateSelectionBox(true);
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
        }
      }
    },
    /**
     * Updates the lane children when a element is moved into the pool
     * @param {Array} selected
     */
    updateLaneChildren(selected){
      if (!selected) {
        return;
      }
      const pool = selected.find(({ model }) => {
        if (model.getParentCell()) {
          return model.getParentCell().component.node.type === poolId;
        }
        return false;
      });
      if (pool){
        pool.model.getParentCell();
        pool.model.component.laneSet && pool.component.updateLaneChildren();
      }
    },
    moveElements(selected, oldPool, newPool){
      const shapesToMove= [
        'PoolLane',
        'standard.Link',
        'processmaker.components.nodes.boundaryEvent.Shape',
      ];
      selected.filter(shape => !shapesToMove.includes(shape.model.get('type')))
        .forEach(shape => {
          oldPool.model.component.moveElement(shape.model, newPool.model);
        });
    },
    moveConectedLinks(links, oldPool, newPool){
      links.forEach(link => {
        oldPool.model.component.moveFlow(link.model, newPool.model);
      });
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
