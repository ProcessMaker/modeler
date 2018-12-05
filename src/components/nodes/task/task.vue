<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import connectIcon from '@/assets/connect-elements.svg';
import crownConfig from '@/mixins/crownConfig';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from './index';

const labelPadding = 15;

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      crownConfig: [
        {
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  watch: {
    'node.definition.name'(name) {
      const { width } = this.node.diagram.bounds;
      this.shape.attr('label/text', joint.util.breakText(name, { width }));

      /* Update shape height if label text overflows */
      const labelHeight = this.shapeView.selectors.label.getBBox().height;
      const { height } = this.shape.size();

      if (labelHeight + labelPadding !== height) {
        const newHeight = Math.max(labelHeight + 15, taskHeight);
        this.node.diagram.bounds.height = newHeight;
        this.shape.resize(width, newHeight);
      }
    },
  },
  mounted() {
    this.shape = new TaskShape();

    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      body: {
        rx: 8,
        ry: 8,
      },
      label: {
        text: joint.util.breakText(this.node.definition.get('name'), { width: bounds.width }),
        fill: 'black',
      },
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
        element
      );
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
