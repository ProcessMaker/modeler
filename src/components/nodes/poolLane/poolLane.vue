<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import resizeConfig from '@/mixins/resizeConfig';
import { labelWidth } from '../pool/poolSizes';

export default {
  props: ['graph', 'node', 'nodes', 'id', 'collaboration'],
  mixins: [crownConfig, resizeConfig],
  data() {
    return {
      shape: null,
      definition: null,
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    this.shape = new joint.shapes.standard.Rectangle();

    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.attr('body/cursor', 'default');
    this.shape.attr('label', {
      text: joint.util.breakText(this.node.definition.get('name'), { width: bounds.height }),
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    });

    this.shape.component = this;
    this.shape.addTo(this.graph);
  },
};
</script>
