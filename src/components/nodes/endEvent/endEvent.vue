<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import portsConfig from '@/mixins/portsConfig';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import EventShape from '../startEvent/eventShape';
import { endColor } from '@/components/nodeColors';

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig, portsConfig, hideLabelOnDrag],
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
    this.shape = new EventShape();
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      body: {
        fill: endColor,
        originalFill: endColor,
        stroke: '#ED4757',
      },
      label: {
        text: this.node.definition.get('name'),
        refY: '130%',
      },
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
