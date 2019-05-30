<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';
import GatewayShape from '@/components/nodes/gateway/shape';

export default {
  props: ['graph', 'node'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      labelWidth: 175,
      crownConfig: [
        {
          id: 'sequence-flow-button',
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('.label/text', name);
    },
  },
  mounted() {
    this.shape = new GatewayShape();
    const defaultName = this.node.definition.get('name');
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      '.label': {
        text: this.$t(defaultName),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
