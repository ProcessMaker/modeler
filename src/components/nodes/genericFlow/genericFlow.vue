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
    v-on="$listeners"
  />
</template>

<script>
import { shapes } from 'jointjs';
import linkConfig from '@/mixins/linkConfig';
import get from 'lodash/get';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import MessageFlow from '@/components/nodes/genericFlow/MessageFlow';
import SequenceFlow from '@/components/nodes/genericFlow/SequenceFlow';
import DataOutputAssociation from '@/components/nodes/genericFlow/DataOutputAssociation';
import { id } from './config';

const BpmnFlows = [
  DataOutputAssociation,
  SequenceFlow,
  MessageFlow,
];

export default {
  name: id,
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
      return BpmnFlows.some(FlowClass => {
        return FlowClass.isValid({
          sourceShape: this.sourceShape,
          targetShape: this.target,
          sourceConfig: this.sourceConfig,
          targetConfig: this.targetConfig,
        });
      });
    },
    targetType() {
      return get(this.target, 'component.node.type');
    },
    shapeName() {
      return this.node.definition.get('name');
    },
    nameLabel: {
      get() {
        return this.shape.label(0).attrs.text.text;
      },
      set(text = '') {
        this.shape.label(0, {
          attrs: {
            text: { text },
          },
        });
      },
    },
  },
  watch: {
    'node.definition': {
      handler() {
        const newNameLabel = this.shapeName;

        if (newNameLabel !== this.nameLabel) {
          this.nameLabel = newNameLabel;
        }
        this.setDefaultMarker(this.isDefaultFlow());
      },
      deep: true,
    },
    'node.definition.sourceRef': {
      handler() {
        this.setDefaultMarker(this.isDefaultFlow());
      },
      deep: true,
    },
  },
  methods: {
    completeLink() {
      const Flow = BpmnFlows.find(FlowClass => {
        return FlowClass.isValid({
          sourceShape: this.sourceShape,
          targetShape: this.target,
          sourceConfig: this.sourceConfig,
          targetConfig: this.targetConfig,
        });
      });
      const flow = new Flow(this.nodeRegistry, this.moddle, this.paper);
      const genericLink = this.shape.findView(this.paper);
      this.$emit('replace-generic-flow', {
        actualFlow: flow.makeFlowNode(this.sourceShape, this.target, genericLink),
        genericFlow: this.node,
        targetNode: get(this.target, 'component.node'),
      });
    },
    updateRouter() {
      this.shape.router('normal');
    },
    createDefaultFlowMarker() {
      this.shape.attr('line', {
        strokeWidth: 1,
        strokeDasharray: '2 2',
      });
    },
  },
  mounted() {
    this.shape = new shapes.standard.Link();
    this.shape.connector('rounded', { radius: 5 });
    this.createDefaultFlowMarker();

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
