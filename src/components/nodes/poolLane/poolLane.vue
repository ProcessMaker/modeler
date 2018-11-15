<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import { id as laneId } from './index';
import { labelWidth } from '../pool';

export default {
  props: ['graph', 'node', 'nodes', 'id', 'collaboration'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
    };
  },
  computed: {
    parentPool() {
      return this.shape.getParentCell();
    },
  },
  methods: {
    getShape() {
      return this.shape;
    },
    updateShape() {
      const bounds = this.node.diagram.bounds;
      this.shape.position(bounds.x, bounds.y);
      this.shape.resize(bounds.width, bounds.height);
      this.shape.attr({
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
      this.$parent.loadInspector(laneId, this.node.definition, this);
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
  },
  mounted() {
    this.shape = new joint.shapes.standard.Rectangle();

    const bounds = this.node.diagram.bounds;

    this.shape.attr('body/cursor', 'default');
    this.shape.attr('label', {
      text: joint.util.breakText(this.node.definition.get('name'), { width: bounds.height }),
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    });

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

    this.shape.component = this;
    this.$parent.nodes[this.id].component = this;
    this.shape.addTo(this.graph);
  },
};
</script>
