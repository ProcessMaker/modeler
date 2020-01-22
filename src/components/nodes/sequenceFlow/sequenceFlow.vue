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
import { id as laneId } from '../poolLane';
import { expressionPosition } from './sequenceFlowConfig';
import store from '@/store';
import { id as subProcessId } from '@/components/nodes/subProcess';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';

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
      return this.isValidTarget() && this.isValidSource();
    },
    targetType() {
      return get(this.target, 'component.node.type');
    },
    label: {
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
    sourceIsGateway() {
      return ['bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway'].includes(this.node.definition.sourceRef.$type);
    },
    targetIsCallActivity() {
      return this.targetType === subProcessId;
    },
  },
  watch: {
    'node.definition': {
      handler({ startEvent: startEventId, conditionExpression }) {
        if (!this.sourceIsGateway && !this.targetIsCallActivity) {
          return;
        }

        const startEvent = store.getters.globalProcessEvents.find(event => event.id == startEventId);
        const newLabel = get(conditionExpression, 'body') || get(startEvent, 'name');

        if (newLabel !== this.label) {
          this.label = newLabel;
        }
      },
      deep: true,
    },
  },
  methods: {
    updateRouter() {
      this.shape.router('orthogonal', { padding: 1 });
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();

      this.node.definition.targetRef = targetShape.component.node.definition;
      this.sourceShape.component.node.definition.get('outgoing').push(this.node.definition);
      targetShape.component.node.definition.get('incoming').push(this.node.definition);
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
        this.allowOutgoingFlow() &&
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
    allowOutgoingFlow() {
      return this.sourceConfig.allowOutgoingFlow == null ||
        this.sourceConfig.allowOutgoingFlow(this.targetNode);
    },
    createLabel() {
      this.shape.labels([{
        attrs: {
          text: {
            text: '',
          },
        },
        position: expressionPosition,
      }]);
    },
  },
  mounted() {
    this.shape = new shapes.standard.Link();
    this.shape.connector('rounded', { radius: 5 });
    this.createLabel();

    const conditionExpression = this.node.definition.conditionExpression;
    if (conditionExpression) {
      this.label = conditionExpression.body;
    }

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
