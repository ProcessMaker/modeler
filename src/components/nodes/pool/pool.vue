<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import Lane from '../poolLane';
import { id as poolId, labelWidth, poolPadding } from './index';
import { id as laneId } from '../poolLane';
import laneIcon from '@/assets/lane.svg';
import BpmnModdle from 'bpmn-moddle';

const moddle = new BpmnModdle();

joint.shapes.standard.Rectangle.define('processmaker.modeler.bpmn.pool', {
  markup: [
    ...joint.shapes.standard.Rectangle.prototype.markup,
    { tagName: 'polyline', selector: 'polyline' },
  ],
  attrs: {
    label: {
      fill: 'black',
      transform: 'rotate(-90)',
      // refX: labelWidth / 2,
    },
    polyline: {
      refPoints: '0,0 0,1',
      pointerEvents: 'none',
      stroke: '#000',
      strokeWidth: 2,
      // refX: labelWidth,
    },
  },
});

export default {
  props: ['graph', 'node', 'nodes', 'id', 'collaboration', 'processes'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      crownConfig: [
        {
          icon: laneIcon,
          clickHandler: this.addLane,
        },
      ],
      laneSet: null,
    };
  },
  computed: {
    containingProcess() {
      return this.processes.find(process =>
        process.id === this.node.definition.get('processRef').id
      );
    },
  },
  methods: {
    addLane() {
      /* A Lane element must be contained in a LaneSet element.
       * Get the current laneSet element or create a new one. */

      if (!this.laneSet) {
        const laneSet = moddle.create('bpmn:LaneSet');
        this.laneSet = laneSet;
        this.containingProcess.get('laneSets').push(laneSet);

        const definition = Lane.definition();

        /* If there are currently elements in the pool, add them to the first lane */
        this.shape.getEmbeddedCells().filter(element => {
          return element.component && element.component.node.type !== laneId;
        }).forEach(element => {
          definition.get('flowNodeRef').push(element.component.node.definition);
        });

        this.pushNewLane(definition);
      }

      this.pushNewLane();
    },
    pushNewLane(definition = Lane.definition()) {
      this.$emit('set-pool-target', this.shape);
      this.$emit('add-node', {
        type: Lane.id,
        definition,
        diagram: Lane.diagram(),
      });
    },
    addToPool(element) {
      this.shape.embed(element);

      /* If there are lanes, add the element to the lane it's above */
      if (element.component.node.type !== laneId && this.laneSet) {
        const lane = this.graph.findModelsUnderElement(element, { searchBy: 'center' }).find(element => {
          return element.component.node.type === laneId;
        });

        lane.component.node.definition.get('flowNodeRef').push(element.component.node.definition);
      }

      this.expandToFixElement(element);
    },
    getShape() {
      return this.shape;
    },
    updateShape() {
      const bounds = this.node.diagram.bounds;
      this.shape.position(bounds.x, bounds.y);
      this.shape.resize(bounds.width, bounds.height);
      this.shape.attr({
        body: {},
        label: {
          text: joint.util.breakText(this.node.definition.get('name'), {
            width: bounds.width,
          }),
          fill: 'black',
        },
      });
      // Alert anyone that we have moved
    },
    handleClick() {
      this.$parent.loadInspector(poolId, this.node.definition, this);
    },
    handleInspectionUpdate(value) {
      // Go through each property and rebind it to our data
      for (const key in value) {
        // Only change if the value is different
        if (this.node.definition[key] != value[key]) {
          this.node.definition[key] = value[key];
        }
      }
      this.updateShape();
    },
    expandToFixElement(element) {
      const { width, height } = this.shape.get('size');
      const { x, y } = this.shape.findView(this.paper).getBBox();

      if (element.component.node.type === laneId) {
        /* Position lane relative to pool */

        const isFirstLane = this.shape.getEmbeddedCells().filter(cell => {
          return cell.component && cell.component.node.type === laneId;
        }).length === 1;

        const laneHeight = isFirstLane ? height : element.component.node.diagram.bounds.height;
        element.resize(width - labelWidth, laneHeight);
        element.position(labelWidth, isFirstLane ? 0 : height, { parentRelative: true });
        this.shape.resize(width, isFirstLane ? height : height + laneHeight);
        this.updateCrownPosition();

        this.graph.findModelsUnderElement(element).filter(laneElement => {
          return laneElement.component && ![poolId, laneId].includes(laneElement.component.node.type);
        }).forEach(laneElement => {
          laneElement.toFront({ deep: true });
        });

        return;
      }

      const {
        x: elementX,
        y: elementY,
        width: elementWidth,
        height: elementHeight,
      } = element.findView(this.paper).getBBox();

      const relativeX = elementX - x;
      const relativeY = elementY - y;

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
        this.updateCrownPosition();
      }
    },
    captureChildren() {
      if (!this.$parent.processNode.flowElements) {
        return;
      }

      this.$parent.processNode.flowElements.forEach(({ id }) => {
        const { shape, node } = this.$parent.nodes[id].component;
        this.shape.embed(shape);
        shape.toFront({ deep: true });
        node.pool = this.shape;
      });

      this.resizePool();
    },
    resizePool() {
      const { width, height } = this.shape.get('size');
      this.shape.fitEmbeds({ padding: poolPadding });
      const bounds = this.node.diagram.bounds;
      this.shape.resize(
        Math.max(width, bounds.width) + labelWidth,
        Math.max(height, bounds.height)
      );
      this.shape.getEmbeddedCells().forEach(cell => cell.translate(labelWidth));
    },
  },
  mounted() {
    this.shape = new joint.shapes.processmaker.modeler.bpmn.pool();
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.attr('label/refX', labelWidth / 2);
    this.shape.attr('polyline/refX', labelWidth);
    this.shape.attr('label/text', joint.util.breakText(this.node.definition.get('name'), {
      width: bounds.width,
    }));

    this.shape.on('change:position', (element, position) => {
      this.node.diagram.bounds.x = position.x;
      this.node.diagram.bounds.y = position.y;
      // This is done so any flows pointing to this task are updated
      this.$emit(
        'move',
        {
          x: bounds.x,
          y: bounds.y,
        },
        element,
      );
    });

    this.shape.on('change:size', (element, newSize) => {
      this.node.diagram.bounds.width = newSize.width;
      this.node.diagram.bounds.height = newSize.height;
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.$parent.nodes[this.id].component = this;

    /* If there are no other pools, the first pool should capture all current flow elements */
    if (this.collaboration.get('participants').length === 1) {
      this.captureChildren();
    }

    this.$nextTick(() => {
      this.shape.listenTo(this.graph, 'change:position', element => {
        if (
          element.component && element.component !== this &&
          element.component.node.type !== laneId &&
          element.getParentCell() && element.getParentCell().component === this
        ) {
          this.expandToFixElement(element);
        }
      });
    });
  },
  beforeDestroy() {
    const participants = this.collaboration.get('participants');
    participants.splice(participants.indexOf(this.node.definition), 1);
  },
};
</script>
