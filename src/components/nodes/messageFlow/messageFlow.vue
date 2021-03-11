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
    @remove-node="$emit('remove-node', $event)"
    @add-node="$emit('add-node', $event)"
    @save-state="$emit('save-state', $event)"
  />
</template>

<script>
import { shapes } from 'jointjs';
import linkConfig from '@/mixins/linkConfig';
import get from 'lodash/get';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import MessageFlow from '@/components/nodes/genericFlow/MessageFlow';

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
  mixins: [linkConfig],
  data() {
    return {
      shape: null,
    };
  },
  computed: {
    isValidConnection() {
      return MessageFlow.isValid({
        sourceShape: this.sourceShape,
        targetShape: this.target,
        sourceConfig: this.sourceConfig,
      });
    },
    targetType() {
      return get(this.target, 'component.node.type');
    },
    sourceType() {
      return get(this.sourceNode, 'type');
    },
  },
  methods: {
    updateRouter() {
      this.shape.router('orthogonal', { padding: 1 });
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();
      this.node.definition.targetRef = targetShape.component.node.definition;
    },
  },
  mounted() {
    this.shape = new shapes.standard.Link({
      router: {
        name: 'orthogonal',
      },
    });

    this.shape.attr('line', {
      strokeDasharray: '10 10',
      sourceMarker: {
        type: 'circle',
        r: 5,
        'stroke-width': 2,
        fill: '#fff',
      },
      targetMarker: {
        type: 'path',
        fill: '#fff',
        'stroke-width': 2,
        d: 'M 10 -5 0 0 10 5 Z',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
