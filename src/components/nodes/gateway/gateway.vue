<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import portsConfig from '@/mixins/portsConfig';
import connectIcon from '@/assets/connect-elements.svg';
import GatewayShape from '@/components/nodes/gateway/shape';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';

export default {
  props: ['graph', 'node'],
  mixins: [crownConfig, portsConfig, hideLabelOnDrag],
  data() {
    return {
      shape: null,
      definition: null,
      labelWidth: 175,
      crownConfig: [
        {
          id: 'sequence-flow-button',
          title: this.$t('Sequence Flow'),
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
    this.shape = new GatewayShape();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      label: {
        text: this.node.definition.get('name'),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
