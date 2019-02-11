<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';
import StartEventShape from '@/components/nodes/startEvent/shape';

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
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    // Now, let's add a rounded rect to the graph
    this.shape = new StartEventShape();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      body: {
        stroke: '#00bf9c',
        fill: '#EDFFFC',
      },
      label: {
        text: this.node.definition.get('name'),
        refY: '130%',
      },
      image: {
          'ref-x': 5,
          'ref-y': 5,
          'width': bounds.get('width') - 10,
          'height': bounds.get('height') - 10,
      },
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
