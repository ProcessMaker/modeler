<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :nodeRegistry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    v-on="$listeners"
  >
    <add-lane-above-button
      v-b-tooltip.hover.viewport.d50
      @click="addLaneAbove"
      class="crown-config__icon"
      :title="$t('Lane Above')"
    />
    <add-lane-below-button
      v-b-tooltip.hover.viewport.d50
      @click="addLaneBelow"
      class="crown-config__icon"
      :title="$t('Lane Below')"
    />
  </crown-config>
</template>

<script>
import portsConfig from '@/mixins/portsConfig';
import resizeConfig from '@/mixins/resizeConfig';
import Lane from '../poolLane';
import { id as laneId } from '@/components/nodes/poolLane/config';
import { id as messageFlowId } from '@/components/nodes/messageFlow/config';
import { labelWidth, poolPadding } from './poolSizes';
import pull from 'lodash/pull';
import store from '@/store';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';
import AddLaneAboveButton from '@/components/crown/crownButtons/addLaneAboveButton';
import AddLaneBelowButton from '@/components/crown/crownButtons/addLaneBelowButton';
import { configurePool, elementShouldHaveFlowNodeRef } from '@/components/nodes/pool/poolUtils';
import PoolEventHandlers from '@/components/nodes/pool/poolEventHandlers';
import Node from '@/components/nodes/node';
import { aPortEveryXPixels } from '@/portsUtils';

export default {
  components: {
    CrownConfig,
    AddLaneAboveButton,
    AddLaneBelowButton,
  },
  props: [
    'graph',
    'node',
    'nodes',
    'id',
    'collaboration',
    'processes',
    'moddle',
    'processNode',
    'rootElements',
    'highlighted',
    'nodeRegistry',
    'paper',
    'planeElements',
    'isRendering',
    'paperManager',
    'nodeIdGenerator',
  ],
  mixins: [highlightConfig, resizeConfig, portsConfig],
  data() {
    return {
      shape: null,
      definition: null,
      laneSet: null,
      isAddingLaneAbove: false,
      anchorPointFunction: aPortEveryXPixels(20),
    };
  },
  computed: {
    containingProcess() {
      if (!this.node.definition.get('processRef')) {
        return null;
      }

      return this.processes.find(process =>
        process.id === this.node.definition.get('processRef').id,
      );
    },
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  methods: {
    addLaneAbove() {
      this.isAddingLaneAbove = true;
      this.addLane();
    },
    addLaneBelow() {
      this.isAddingLaneAbove = false;
      this.addLane();
    },
    sortedLanes() {
      return this.shape.getEmbeddedCells().filter(({ component }) => {
        return component && component.node.type === laneId;
      }).sort((shape1, shape2) => {
        /* Sort by y position ascending */
        return shape1.position().y - shape2.position().y;
      });
    },
    getElementsUnderArea(element, graph) {
      const { x, y, width, height } = element.getBBox();
      const area = { x, y, width, height };

      return graph.findModelsInArea(area);
    },
    moveEmbeddedElements(currentElement, toPool) {
      this.getElementsUnderArea(currentElement, this.graph)
        .filter(element => element.isEmbeddedIn(currentElement))
        .map(element => element.component.node.definition)
        .forEach((elementDefinition) => {
          pull(this.containingProcess.get('flowElements'), elementDefinition);
          toPool.component.containingProcess.get('flowElements').push(elementDefinition);
        });
    },
    moveElement(element, toPool) {
      const elementDefinition = element.component.node.definition;

      if (this.laneSet) {
        /* Remove references to the element from the current Lane */
        const containingLane = this.laneSet.get('lanes').find(lane => {
          return lane.get('flowNodeRef').includes(elementDefinition);
        });

        pull(containingLane.get('flowNodeRef'), elementDefinition);
      }

      /* Remove references to the element from the current process */
      pull(this.containingProcess.get('flowElements'), elementDefinition);

      toPool.component.containingProcess.get('flowElements').push(elementDefinition);
      this.moveEmbeddedElements(element, toPool);

      element.component.node.pool = toPool;
      this.shape.unembed(element);
      toPool.component.addToPool(element);
    },
    async addLane() {
      /* A Lane element must be contained in a LaneSet element.
         * Get the current laneSet element or create a new one. */

      const lanes = [];

      if (!this.laneSet) {
        this.createLaneSet();

        const definition = Lane.definition(this.moddle, this.$t);

        /* If there are currently elements in the pool, add them to the first lane */
        this.shape.getEmbeddedCells().filter(element => elementShouldHaveFlowNodeRef(element))
          .forEach(element => {
            definition.get('flowNodeRef').push(element.component.node.definition);
          });

        lanes.push(this.pushNewLane(definition));
      }

      lanes.push(this.pushNewLane());

      await Promise.all(lanes);
      this.$emit('set-shape-stacking', this.shape);
      this.graph.getLinks().forEach(link => {
        this.$emit('set-shape-stacking', link);
      });
      this.$emit('save-state');
    },
    createLaneSet() {
      const laneSet = this.moddle.create('bpmn:LaneSet');
      this.laneSet = laneSet;
      const generator = this.nodeIdGenerator;
      const [laneSetId] = generator.generate();
      this.laneSet.set('id', laneSetId);
      this.containingProcess.get('laneSets').push(laneSet);
    },
    pushNewLane(definition = Lane.definition(this.moddle, this.$t)) {
      definition.set('color', this.node.definition.get('color'));
      this.$emit('set-pool-target', this.shape);

      const diagram = Lane.diagram(this.moddle);
      diagram.bounds.width = this.shape.getBBox().width;

      this.$emit('add-node', new Node(
        Lane.id,
        definition,
        diagram,
      ));

      return this.$nextTick();
    },
    addToPool(element) {
      if (element.component.node.isBpmnType('bpmn:BoundaryEvent')) {
        return;
      }
      this.shape.unembed(element);
      this.shape.embed(element);

      this.expandToFitElement(element, this.shape);

      /* If there are lanes, add the element to the lane it's above */
      if (element.component.node.type !== laneId && this.laneSet) {
        this.updateLaneChildren();
      }
    },
    positionAndSizeLane(laneElement, pool) {
      const { width, height } = pool.getBBox();
      const elementBounds = laneElement.component.node.diagram.bounds;

      if (elementBounds.x && elementBounds.y) {
        /* If lane already has a position, don't re-position or re-size it. */
        return;
      }

      const isFirstLane = pool.getEmbeddedCells().filter(cell => {
        return cell.component && cell.component.node.type === laneId;
      }).length === 1;

      const laneHeight = isFirstLane ? height : elementBounds.height;
      laneElement.resize(width - labelWidth, laneHeight);
      laneElement.position(
        labelWidth,
        isFirstLane
          ? 0
          : this.isAddingLaneAbove ? -laneHeight : height,
        { parentRelative: true },
      );
      pool.resize(width, isFirstLane ? height : height + laneHeight, {
        direction: this.isAddingLaneAbove ? 'top-right' : 'bottom-right',
      });

      this.fixResizeRounding();
      this.updateAnchorPointPosition();

      const { x, y } = laneElement.position();
      elementBounds.set('x', x);
      elementBounds.set('y', y);
      elementBounds.set('width', laneElement.get('size').width);
      elementBounds.set('height', laneElement.get('size').height);

      store.commit('updateNodeBounds', {
        node: this.node,
        bounds: pool.getBBox(),
      });
    },
    expandToFitElement(element, pool) {
      if (element.component.node.type === messageFlowId) {
        return;
      }

      const { x: poolX, y: poolY, width, height } = pool.getBBox();

      if (element.component.node.type === laneId) {
        this.positionAndSizeLane(element, pool);
        return;
      }

      const { width: elementWidth, height: elementHeight } = element.get('size');
      const { x: elementX, y: elementY } = element.position();

      const relativeX = elementX - poolX;
      const relativeY = elementY - poolY;

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

      if (bottomEdge > height - poolPadding) {
        newHeight = bottomEdge + poolPadding;
      }

      if (newWidth || newHeight) {
        pool.resize(Math.max(newWidth, width), Math.max(newHeight, height), {
          direction: `${directionHeight}-${directionWidth}`,
        });

        this.fixResizeRounding();
        this.updateAnchorPointPosition();

        if (this.laneSet) {
          /* Expand any lanes within the pool */
          this.resizeLanes();

          this.sortedLanes().forEach(laneShape => {
            store.commit('updateNodeBounds', {
              node: laneShape.component.node,
              bounds: laneShape.getBBox(),
            });
          });
        }

        store.commit('updateNodeBounds', {
          node: this.node,
          bounds: pool.getBBox(),
        });

        this.$emit('save-state');
      }
    },
    fillLanes(resizingLane, direction, remove) {
      const poolHeight = this.shape.get('size').height;
      const lanesHeight = this.sortedLanes().reduce((sum, lane) => {
        return sum + lane.getBBox().height;
      }, 0);
      const heightDiff = remove
        ? resizingLane.get('size').height
        : poolHeight - lanesHeight;

      let resizeDirection;
      switch (direction) {
        case 'top-right':
          resizeDirection = 'bottom-right';
          break;
        case 'top-left':
          resizeDirection = 'bottom-left';
          break;
        case 'bottom-right':
          resizeDirection = 'top-right';
          break;
        case 'bottom-left':
          resizeDirection = 'top-left';
          break;
      }

      const resizingLaneIndex = this.sortedLanes().indexOf(resizingLane);
      const { width: resizingLaneWidth } = resizingLane.getBBox();
      const laneToResize = this.sortedLanes()[resizingLaneIndex + (direction.includes('top') ? -1 : 1)];

      laneToResize.resize(resizingLaneWidth, laneToResize.getBBox().height + heightDiff, { direction: resizeDirection });
      this.shape.resize(resizingLaneWidth + labelWidth, poolHeight, { direction: resizeDirection });

      this.sortedLanes().forEach(lane => lane.resize(resizingLaneWidth, lane.getBBox().height, { direction: resizeDirection }));
    },
    resizeLanes() {
      this.sortedLanes().forEach((laneShape, index, lanes) => {
        const { width, height } = this.shape.get('size');
        const { height: laneHeight } = laneShape.get('size');
        const { y: laneY } = laneShape.position({ parentRelative: true });

        let newHeight = laneHeight;
        let newY = laneY;

        if (index === 0) {
          /* Expand the height of the fist lane up */
          newHeight = laneHeight + laneShape.position({ parentRelative: true }).y;
          newY = 0;
        }

        if (index === lanes.length - 1) {
          /* Expand the height of the last lane down */
          const addedHeight = height - (laneShape.position({ parentRelative: true }).y + laneHeight);
          newHeight = laneHeight + addedHeight;
        }

        laneShape.resize(width - labelWidth, newHeight);
        laneShape.position(labelWidth, newY, { parentRelative: true });
      });
    },
    captureChildren() {
      this.graph.getElements().filter(({ component }) => component && component !== this).forEach(({ component }) => {
        if (component.node.isBpmnType('bpmn:BoundaryEvent')) {
          return;
        }
        this.shape.embed(component.shape);
        component.node.pool = this.shape;
      });
      this.$emit('set-shape-stacking', this.shape);
      this.resizePool(this.shape);
    },
    fitEmbeds() {
      this.shape.fitEmbeds({ padding: poolPadding + labelWidth });
      this.shape.resize(
        this.shape.getBBox().width - labelWidth,
        this.shape.getBBox().height - labelWidth,
      );
      this.shape.resize(
        this.shape.getBBox().width,
        this.shape.getBBox().height - labelWidth,
        { direction: 'top' },
      );
    },
    resizePool(pool) {
      this.fitEmbeds();
      const { width, height } = this.shape.get('size');
      const bounds = this.node.diagram.bounds;
      this.shape.resize(
        /* Add labelWidth to ensure elements don't overlap with the pool label */
        Math.max(width, bounds.width),
        Math.max(height, bounds.height),
      );
      this.shape.getEmbeddedCells().forEach(cell => {
        this.expandToFitElement(cell, pool);
      });
      const { x, y } = this.shape.position();
      const { width: newWidth, height: newHeight } = this.shape.get('size');
      this.node.diagram.bounds.x = x;
      this.node.diagram.bounds.y = y;
      this.node.diagram.bounds.width = newWidth;
      this.node.diagram.bounds.height = newHeight;
    },
    updateLaneChildren() {
      /* Ensure elements in the pool are added to the lanes they are above */

      const newLaneRefs = {};

      this.shape
        .getEmbeddedCells()
        .filter(element =>
          elementShouldHaveFlowNodeRef(element) &&
            element.component.node.pool === this.shape
        )
        .forEach(element => {
          const lane = this.graph
            .findModelsUnderElement(element, { searchBy: 'center' })
            .find(element => element.component && element.component.node.type === laneId);

          newLaneRefs[lane.id]
            ? newLaneRefs[lane.id].push(element.component.node.definition)
            : newLaneRefs[lane.id] = [element.component.node.definition];
        });

      this.sortedLanes().forEach(laneShape => {
        const newRefs = newLaneRefs[laneShape.id];
        const currentRefs = laneShape.component.node.definition.get('flowNodeRef');

        const hasChanged = newRefs
          ? newRefs.length !== currentRefs.length
          : currentRefs.length > 0;

        if (hasChanged) {
          store.commit('updateNodeProp', {
            node: laneShape.component.node,
            key: 'flowNodeRef',
            value: newRefs || [],
          });
        }
      });
    },
    hasPools() {
      return this.collaboration.get('participants').length > 0;
    },
    setPoolSize(pool) {
      pool.getEmbeddedCells().forEach(cell => {
        this.expandToFitElement(cell, pool);
      });

      const { x, y } = pool.position();
      const { width: newWidth, height: newHeight } = pool.get('size');
      this.node.diagram.bounds.x = x;
      this.node.diagram.bounds.y = y;
      this.node.diagram.bounds.width = newWidth;
      this.node.diagram.bounds.height = newHeight;
    },
  },
  mounted() {
    // Do some initialization on parent
    this.$emit('set-pools', this.node.definition);

    this.laneSet = this.containingProcess.get('laneSets')[0];

    this.shape = configurePool(this.collaboration, this.node, this.graph);
    this.shape.component = this;
    /* If there are no other pools, the first pool should capture all current flow elements.
     * Don't do this when parsing an uploaded diagram. */
    if (!this.collaboration) {
      this.captureChildren();
    }
    this.setPoolSize(this.shape);
    this.$emit('set-shape-stacking', this.shape);

    this.$nextTick(() => {
      const handler = new PoolEventHandlers(this.graph, this.paper, this.paperManager, this.shape, this);
      this.shape.listenTo(this.graph, 'change:position', (element, newPosition) => handler.onChangePosition(element, newPosition));
      this.shape.listenTo(this.paper, 'cell:pointerdown', (cellView) => handler.onPointerDown(cellView));
      this.shape.listenTo(this.paper, 'cell:pointerup', (cellView) => handler.onPointerUp(cellView));
    });
  },
  beforeDestroy() {
    const participants = this.collaboration.get('participants');
    pull(participants, this.node.definition);

    if (!this.hasPools()) {
      this.$emit('unset-pools');
    } else {
      pull(this.rootElements, this.containingProcess);
    }
  },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>
