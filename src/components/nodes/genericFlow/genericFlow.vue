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
  {
    type: 'processmaker-modeler-text-annotation',
    factory: DataOutputAssociation,
  },
  {
    type: 'processmaker-modeler-sequence-flow',
    factory: SequenceFlow,
  },
  {
    type: 'processmaker-modeler-message-flow',
    factory: MessageFlow,
  },
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
        return FlowClass.factory.isValid({
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
  },
  methods: {
    completeLink() {
      const bpmnFlow = BpmnFlows.find(FlowClass => {
        return FlowClass.factory.isValid({
          sourceShape: this.sourceShape,
          targetShape: this.target,
          sourceConfig: this.sourceConfig,
          targetConfig: this.targetConfig,
        });
      });
      const flow = new bpmnFlow.factory(this.nodeRegistry, this.moddle, this.paper);
      const genericLink = this.shape.findView(this.paper);
      const waypoint =  [genericLink.sourceAnchor.toJSON(), genericLink.targetAnchor.toJSON()];
      // Multiplayer hook
      if (this.$parent.isMultiplayer) {
        window.ProcessMaker.EventBus.$emit('multiplayer-addFlow', {
          type: bpmnFlow.type,
          id: `node_${this.$parent.nodeIdGenerator.getDefinitionNumber()}`,
          sourceRefId: this.sourceNode.definition.id,
          targetRefId: this.targetNode.definition.id,
          waypoint,
        });
      }

      this.$emit('replace-generic-flow', {
        actualFlow: flow.makeFlowNode(this.sourceShape, this.target, waypoint),
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
