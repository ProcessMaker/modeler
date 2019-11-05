<template>
  <div/>
</template>

<script>
import { shapes, util } from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import resizeConfig from '@/mixins/resizeConfig';
import portsConfig from '@/mixins/portsConfig';
import Lane from '../poolLane';
import { id as poolId } from './index';
import { id as messageFlowId } from '@/components/nodes/messageFlow/index';
import { poolPadding, labelWidth } from './poolSizes';
import { id as laneId } from '../poolLane';
import { id as textAnnotationId } from '@/components/nodes/textAnnotation/index';
import laneAboveIcon from '@/assets/lane-above.svg';
import laneBelowIcon from '@/assets/lane-below.svg';
import { invalidNodeColor, defaultNodeColor, poolColor } from '@/components/nodeColors';
import pull from 'lodash/pull';
import store from '@/store';

const Pool = shapes.standard.Rectangle.define('processmaker.modeler.bpmn.pool', {
  markup: [
    ...shapes.standard.Rectangle.prototype.markup,
    { tagName: 'polyline', selector: 'polyline' },
  ],
  attrs: {
    label: {
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    },
    polyline: {
      refPointsKeepOffset: `${labelWidth},0 ${labelWidth},200`,
      stroke: '#000',
      fill: '#fff',
      strokeWidth: 2,
    },
  },
});

export default {
  props: ['graph', 'node', 'nodes', 'id', 'collaboration', 'processes', 'moddle', 'processNode', 'rootElements'],
  mixins: [crownConfig, resizeConfig, portsConfig],
  data() {
    return {
      shape: null,
      definition: null,
      crownConfig: [
        {
          id: 'lane-above-button',
          title: this.$t('Lane Above'),
          icon: laneAboveIcon,
          clickHandler: () => {
            this.addLaneAbove = true;
            this.addLane();
          },
        },
        {
          id: 'lane-below-button',
          title: this.$t('Lane Below'),
          icon: laneBelowIcon,
          clickHandler: () => {
            this.addLaneAbove = false;
            this.addLane();
          },
        },
      ],
      laneSet: null,
      addLaneAbove: false,
    };
  },
  computed: {
    containingProcess() {
      if (!this.node.definition.get('processRef')) {
        return null;
      }

      return this.processes.find(process =>
        process.id === this.node.definition.get('processRef').id
      );
    },
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  methods: {
    sortedLanes() {
      return this.shape.getEmbeddedCells().filter(({ component }) => {
        return component && component.node.type === laneId;
      }).sort((shape1, shape2) => {
        /* Sort by y position ascending */
        return shape1.position().y - shape2.position().y;
      });
    },
    getElementsUnderArea(element) {
      const { x, y, width, height} = element.getBBox();
      const area = { x, y, width, height };

      return this.graph.findModelsInArea(area);
    },
    moveEmbeddedElements(currentElement, toPool) {
      this.getElementsUnderArea(currentElement)
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
        this.shape.getEmbeddedCells().filter(element => {
          return element.component &&
            element.component.node.type !== laneId &&
            element.component.node.type !== textAnnotationId;
        }).forEach(element => {
          definition.get('flowNodeRef').push(element.component.node.definition);
        });

        lanes.push(this.pushNewLane(definition));
      }

      lanes.push(this.pushNewLane());

      await Promise.all(lanes);
      this.$emit('set-shape-stacking', this.shape);
      this.$emit('save-state');
    },
    createLaneSet() {
      const laneSet = this.moddle.create('bpmn:LaneSet');
      this.laneSet = laneSet;
      this.containingProcess.get('laneSets').push(laneSet);
    },
    pushNewLane(definition = Lane.definition(this.moddle, this.$t)) {
      this.$emit('set-pool-target', this.shape);

      const diagram = Lane.diagram(this.moddle);
      diagram.bounds.width = this.shape.getBBox().width;

      this.$emit('add-node', {
        type: Lane.id,
        definition,
        diagram,
      });

      return this.$nextTick();
    },
    addToPool(element) {
      if (element.component.node.definition.$type === 'bpmn:BoundaryEvent') {
        return;
      }
      this.shape.unembed(element);
      this.shape.embed(element);

      this.expandToFitElement(element);

      /* If there are lanes, add the element to the lane it's above */
      if (element.component.node.type !== laneId && this.laneSet) {
        this.updateLaneChildren();
      }
    },
    expandToFitElement(element) {
      if (element.component.node.type === messageFlowId) {
        return;
      }

      const { x: poolX, y: poolY, width, height } = this.shape.getBBox();

      if (element.component.node.type === laneId) {
        /* Position lane relative to pool */

        const elementBounds = element.component.node.diagram.bounds;

        if (elementBounds.x && elementBounds.y) {
          /* If lane already has a position, don't re-position or re-size it. */
          return;
        }

        const isFirstLane = this.shape.getEmbeddedCells().filter(cell => {
          return cell.component && cell.component.node.type === laneId;
        }).length === 1;

        const laneHeight = isFirstLane ? height : elementBounds.height;
        element.resize(width - labelWidth, laneHeight);
        element.position(
          labelWidth,
          isFirstLane
            ? 0
            : this.addLaneAbove ? -laneHeight : height,
          { parentRelative: true }
        );
        this.shape.resize(width, isFirstLane ? height : height + laneHeight, {
          direction: this.addLaneAbove ? 'top-right' : 'bottom-right',
        });

        this.fixResizeRounding();

        this.updateCrownPosition();
        this.updateAnchorPointPosition();

        this.getElementsUnderArea(element).filter(laneElement => {
          return laneElement.component &&
            ![poolId, laneId].includes(laneElement.component.node.type) &&
            laneElement.component.node.pool.component === this;
        }).forEach(laneElement => {
          if (isFirstLane) {
            this.shape.unembed(laneElement);
            this.shape.embed(laneElement);
          }
        });

        const { x, y } = element.position();
        elementBounds.set('x', x);
        elementBounds.set('y', y);
        elementBounds.set('width', element.get('size').width);
        elementBounds.set('height', element.get('size').height);

        store.commit('updateNodeBounds', {
          node: this.node,
          bounds: this.shape.getBBox(),
        });

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
        this.shape.resize(Math.max(newWidth, width), Math.max(newHeight, height), {
          direction: `${directionHeight}-${directionWidth}`,
        });

        this.fixResizeRounding();

        this.updateCrownPosition();
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
          bounds: this.shape.getBBox(),
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
        case 'top-right': resizeDirection = 'bottom-right'; break;
        case 'top-left': resizeDirection = 'bottom-left'; break;
        case 'bottom-right': resizeDirection = 'top-right'; break;
        case 'bottom-left': resizeDirection = 'top-left'; break;
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
      this.graph
        .getElements()
        .filter(({ component }) => component && component !== this)
        .forEach(({ component }) => {
          if (component.node.definition.$type === 'bpmn:BoundaryEvent'){
            return;
          }
          this.shape.embed(component.shape);
          component.node.pool = this.shape;
        });

      this.$emit('set-shape-stacking', this.shape);
      this.resizePool();
    },
    fitEmbeds() {
      this.shape.fitEmbeds({ padding: poolPadding + labelWidth });
      this.shape.resize(
        this.shape.getBBox().width - labelWidth,
        this.shape.getBBox().height - labelWidth
      );
      this.shape.resize(
        this.shape.getBBox().width,
        this.shape.getBBox().height - labelWidth,
        { direction: 'top' }
      );
    },
    resizePool() {
      this.fitEmbeds();

      const { width, height } = this.shape.get('size');
      const bounds = this.node.diagram.bounds;

      this.shape.resize(
        /* Add labelWidth to ensure elements don't overlap with the pool label */
        Math.max(width, bounds.width),
        Math.max(height, bounds.height)
      );

      this.shape.getEmbeddedCells().forEach(cell => {
        this.expandToFitElement(cell);
      });

      const { x, y } = this.shape.position();
      const { width: newWidth, height: newHeight } = this.shape.get('size');
      this.node.diagram.bounds.x = x;
      this.node.diagram.bounds.y = y;
      this.node.diagram.bounds.width = newWidth;
      this.node.diagram.bounds.height = newHeight;
    },
    isPoolChild(model) {
      return model.component && model.component !== this &&
        model.component.node.type !== laneId &&
        model.getParentCell() && model.getParentCell().component === this;
    },
    updateLaneChildren() {
      /* Ensure elements in the pool are added to the lanes they are above */

      const newLaneRefs = {};

      this.shape
        .getEmbeddedCells()
        .filter(element =>
          element.component &&
          element.component.node.pool === this.shape &&
          element.component.node.type !== laneId &&
          element.component.node.type !==  textAnnotationId
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
  },
  mounted() {
    this.$emit('set-pools', this.node.definition);
    this.laneSet = this.containingProcess.get('laneSets')[0];

    this.shape = new Pool();
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr('label/text', util.breakText(this.node.definition.get('name'), {
      width: bounds.width,
    }));
    this.shape.attr('body', {
      fill: poolColor,
      originalFill: poolColor,
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;

    /* If there are no other pools, the first pool should capture all current flow elements.
     * Don't do this when parsing an uploaded diagram. */
    if (!this.collaboration) {
      this.captureChildren();
    }

    this.$nextTick(() => {
      let previousValidPosition;
      let draggingElement;
      let newPool;
      let invalidPool;

      this.shape.listenTo(this.graph, 'change:position', (element, newPosition) => {
        if (!this.isPoolChild(element) || !draggingElement) {
          return;
        }

        /* If the element we are dragging is not over a pool or lane, prevent dropping it.
         * Also prevent moving the element to another pool if it has a sequence flow, as
         * sequence flows between pools are not valid. */

        const pool = this.getElementsUnderArea(element).find(model => {
          return model.component && model.component.node.type === poolId;
        });

        if (!pool) {
          if (!previousValidPosition) {
            previousValidPosition = newPosition;
          }

          if (invalidPool) {
            invalidPool.attr('body/fill', poolColor);
            invalidPool = null;
          }

          this.paper.drawBackground({ color: invalidNodeColor });
          element.component.allowSetNodePosition = false;
        } else if (pool.component !== this && this.graph.getConnectedLinks(element).length > 0) {
          if (!previousValidPosition) {
            previousValidPosition = newPosition;
          }

          invalidPool = pool.component.shape;
          invalidPool.attr('body/fill', invalidNodeColor);
          element.component.allowSetNodePosition = false;
        } else {
          this.paper.drawBackground({ color: defaultNodeColor });
          previousValidPosition = null;

          if (invalidPool) {
            invalidPool.attr('body/fill', poolColor);
            invalidPool = null;
          }

          newPool = pool !== this.shape
            ? pool
            : null;

          element.component.allowSetNodePosition = true;
        }
      });

      this.shape.listenTo(this.paper, 'cell:pointerdown', cellView => {
        if (!this.isPoolChild(cellView.model)) {
          return;
        }

        if (
          (!draggingElement || draggingElement !== cellView.model) &&
          cellView.model.component && ![poolId, laneId].includes(cellView.model.component.node.type)
        ) {
          draggingElement = cellView.model;
        }
      });

      this.shape.listenTo(this.paper, 'cell:pointerup', cellView => {
        if (!this.isPoolChild(cellView.model)) {
          return;
        }

        if (!draggingElement || draggingElement !== cellView.model) {
          return;
        }

        if (previousValidPosition) {
          draggingElement.position(previousValidPosition.x, previousValidPosition.y, { deep: true });
          store.commit('updateNodeBounds', {
            node: draggingElement.component.node,
            bounds: previousValidPosition,
          });
        }

        if (invalidPool) {
          invalidPool.attr('body/fill', poolColor);
          invalidPool = null;
        }

        if (newPool) {
          /* Remove the shape from its current pool */
          this.moveElement(draggingElement, newPool);
          newPool = null;
        } else {
          this.expandToFitElement(draggingElement);
          this.laneSet && this.updateLaneChildren();
        }

        this.paper.drawBackground({ color: defaultNodeColor });
        draggingElement = null;
      });
    });
  },
  beforeDestroy() {
    const participants = this.collaboration.get('participants');
    pull(participants, this.node.definition);

    if (! this.hasPools()) {
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
