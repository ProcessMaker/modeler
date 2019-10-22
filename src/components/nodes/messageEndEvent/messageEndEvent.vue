<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import portsConfig from '@/mixins/portsConfig';
import EventShape from '@/components/nodes/intermediateEvent/shape';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import intermediateMailSymbol from '@/assets/message-end-event.svg';

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
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr('image/xlink:href', intermediateMailSymbol);
    this.shape.attr({
      body: {
        fill: '#FFCDD3',
        stroke: '#ED4757',
      },
      body2: {
        fill: 'none',
      },
      label: {
        text: this.node.definition.get('name'),
        refY: '130%',
      },
      image: {
        width: 22,
        height: 20,
        y: 3,
        x: 2,
      },
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
