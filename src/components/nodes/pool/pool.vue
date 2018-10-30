<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import { id as poolId } from './index';

const labelWidth = 30;
const poolPadding = 20;

joint.shapes.standard.Rectangle.define('processmaker.modeler.bpmn.pool', {
  markup: [
    ...joint.shapes.standard.Rectangle.prototype.markup,
    { tagName: 'polyline', selector: 'polyline' },
  ],
  attrs: {
    body: {
      rx: 8,
      ry: 8,
    },
    label: {
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    },
    polyline: {
      refPoints: '0,0 0,1',
      pointerEvents: 'none',
      stroke: '#000',
      strokeWidth: 2,
      refX: labelWidth,
    },
  },
});

export default {
  props: ['graph', 'node', 'nodes', 'id', 'collaboration'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
    };
  },
  methods: {
    addToPool(element) {
      this.shape.embed(element);
      this.expandToFixElement(element);
    },
    removePoolChildren() {
      this.shape.getEmbeddedCells().forEach(cell => {
        if (cell.component) {
          cell.component.removeShape();
        }
      });
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
        /* TODO: Update diagram bounds */
      }
    },
    captureChildren() {
      if (!this.$parent.processNode.flowElements) {
        return;
      }

      this.$parent.processNode.flowElements.forEach(({ id }) => {
        const elementShape = this.$parent.nodes[id].component.shape;
        this.shape.embed(elementShape);
        elementShape.toFront({ deep: true });
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
      /* TODO: Update diagram bounds */
    },
  },
  mounted() {
    this.shape = new joint.shapes.processmaker.modeler.bpmn.pool();
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
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
          element.getParentCell() && element.getParentCell().component === this
        ) {
          this.expandToFixElement(element);
        }
      });
    });
  },
  beforeDestroy() {
    this.removePoolChildren();

    const participants = this.collaboration.get('participants');
    participants.splice(participants.indexOf(this.node.definition), 1);
  },
};
</script>
