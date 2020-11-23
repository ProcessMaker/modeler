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
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import { shapes } from 'jointjs';
import portsConfig from '@/mixins/portsConfig';

export default {
  inheritAttrs: false,
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
  mixins: [highlightConfig, hideLabelOnDrag, portsConfig],
  data() {
    return {
      shape: null,
      definition: null,
      dropdownData: [],
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    this.shape = new shapes.standard.Path();
    this.shape.attr('root/title', 'joint.shapes.standard.Path');
    this.shape.attr('label', {
      refY: 65,
      text: this.node.definition.get('name'),
      fill: 'black',
    });
    this.shape.attr('body', {
      refD: 'M1,1 L25,1 L35,10 L35,49 L1,49 L1,1 M24,1 L24,10 L35,10',
    });

    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
