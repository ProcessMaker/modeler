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
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import EventShape from '../startEvent/eventShape';
import { endColor, endColorStroke } from '@/components/nodeColors';
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
      dropdownData: [
        {
          label: 'End Event',
          nodeType: 'processmaker-modeler-end-event',
        },
        {
          label: 'Message End Event',
          nodeType: 'processmaker-modeler-message-end-event',
          dataTest: 'switch-to-message-end-event',
        },
        {
          label: 'Error End Event',
          nodeType: 'processmaker-modeler-error-end-event',
          dataTest: 'switch-to-error-end-event',
        },
        {
          label: 'Signal End Event',
          nodeType: 'processmaker-modeler-signal-end-event',
          dataTest: 'switch-to-signal-end-event',
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
    this.shape = new EventShape();
    this.shape.set('type', 'processmaker.components.nodes.endEvent.Shape');
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      body: {
        fill: endColor,
        originalFill: endColor,
        stroke: endColorStroke,
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
