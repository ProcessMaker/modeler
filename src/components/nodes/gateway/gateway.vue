<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :nodeRegistry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    :dropdown-data="dropdownData"
    v-on="$listeners"
  />
</template>

<script>
import portsConfig from '@/mixins/portsConfig';
import GatewayShape from '@/components/nodes/gateway/shape';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';

export default {
  components: {
    CrownConfig,
  },
  props: [
    'graph',
    'node',
    'id',
    'highlighted',
    'nodeRegistry',
    'moddle',
    'paper',
    'collaboration',
    'processNode',
    'planeElements',
    'isRendering',
  ],
  mixins: [highlightConfig, portsConfig, hideLabelOnDrag],
  data() {
    return {
      shape: null,
      definition: null,
      labelWidth: 175,
      dropdownData: [
        {
          label: 'Exclusive Gateway',
          nodeType: 'processmaker-modeler-exclusive-gateway',
        },
        {
          label: 'Inclusive Gateway',
          nodeType: 'processmaker-modeler-inclusive-gateway',
          dataTest: 'switch-to-inclusive-gateway',
        },
        {
          label: 'Parallel Gateway',
          nodeType: 'processmaker-modeler-parallel-gateway',
          dataTest: 'switch-to-parallel-gateway',
        },
        {
          label: 'Event Based Gateway',
          nodeType: 'processmaker-modeler-event-based-gateway',
          dataTest: 'switch-to-event-based-gateway',
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
