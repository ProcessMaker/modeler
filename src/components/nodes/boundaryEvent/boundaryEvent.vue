<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';
import EventShape from '@/components/nodes/boundaryEvent/shape';

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      crownConfig: [
        {
          id: 'sequence-flow-button',
          title: 'Sequence Flow',
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
    this.shape = new EventShape();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      body: {
        stroke: '#212529',
        strokeWidth: 0.85,
        fill: '#FFF',
      },
      body2: {
        stroke: '#212529',
        fill: '#FFF',
        strokeWidth: 0.85,
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
