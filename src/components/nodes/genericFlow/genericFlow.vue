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
import { id as laneId } from '../poolLane';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import MessageFlow from '@/components/nodes/genericFlow/MessageFlow';
import SequenceFlow from '@/components/nodes/genericFlow/SequenceFlow';

export default {
  name: 'processmaker-modeler-generic-flow',
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
      return [
        SequenceFlow,
        MessageFlow,
      ].some(FlowClass => {
        return FlowClass.isValid(this.sourceShape, this.target, this.sourceConfig);
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
      const Flow = [
        SequenceFlow,
        MessageFlow,
      ].find(FlowClass => {
        return FlowClass.isValid(this.sourceShape, this.target, this.sourceConfig);
      });
      const flow = new Flow(this.nodeRegistry, this.moddle, this.paper);

      // if (flowType) {
      //   flowType.addFn.call(this, this.sourceShape, this.target);
      // }
      // [x] create a new node for flowType
      // [x] set sourceReg and targetRef on that new node
      // [ ] replace this generic node with that new node
      // [ ] kill the listener

      const genericLink = this.shape.findView(this.paper);
      this.$emit('add-node', flow.makeFlowNode(this.sourceShape, this.target, genericLink));
    },
    setDefaultMarker(value) {
      this.shape.attr('line', {
        sourceMarker: {
          'stroke-width': value ? 2 : 0,
        },
      });
    },
    isDefaultFlow() {
      return this.node.definition.sourceRef
        && this.node.definition.sourceRef.default
        && this.node.definition.sourceRef.default.id === this.node.definition.id;
    },
    updateRouter() {
      this.shape.router('orthogonal', { padding: 1 });
    },
    isValidSource() {
      return this.validateIncoming();
    },
    validateIncoming() {
      return this.targetConfig.validateIncoming == null ||
        this.targetConfig.validateIncoming(this.sourceNode);
    },
    isValidTarget() {
      return this.hasTargetType() &&
        this.targetIsNotALane() &&
        this.targetIsInSamePool() &&
        this.targetIsNotSource() &&
        this.eventBasedGatewayTarget();
    },
    eventBasedGatewayTarget() {
      const isSourceEventBasedGateway = this.sourceNode.isBpmnType('bpmn:EventBasedGateway');
      const isTargetIntermediateCatchEvent = this.targetNode.isBpmnType('bpmn:IntermediateCatchEvent');

      return !isSourceEventBasedGateway || isTargetIntermediateCatchEvent;
    },
    hasTargetType() {
      return !!this.targetType;
    },
    targetIsNotALane() {
      return this.targetType !== laneId;
    },
    targetIsInSamePool() {
      const targetPool = this.target.component.node.pool;
      const sourcePool = this.sourceShape.component.node.pool;

      return !sourcePool || sourcePool === targetPool;
    },
    targetIsNotSource() {
      return this.targetNode.id !== this.sourceNode.id;
    },
    createDefaultFlowMarker() {
      this.shape.attr('line', {
        sourceMarker: {
          'type': 'polyline',
          'stroke-width': this.isDefaultFlow() ? 2 : 0,
          points: '2,6 6,-6',
        },
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
