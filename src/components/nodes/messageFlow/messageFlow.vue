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
import { id as poolId } from '../pool';
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
      return this.isValidTarget();
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
    isValidTarget() {
      return this.hasTargetType() &&
        this.targetIsValidType() &&
        this.targetIsValidStartEventType() &&
        this.targetIsValidIntermediateEventType() &&
        this.targetIsNotContainingPool() &&
        this.targetIsInDifferentPool() &&
        this.targetIsNotSource() &&
        this.allowOutgoingFlow();
    },
    targetIsValidStartEventType() {
      if (!this.targetNode.isBpmnType('bpmn:StartEvent')) {
        return true;
      }

      return this.targetNode.isType('processmaker-modeler-message-start-event');
    },
    targetIsValidIntermediateEventType() {
      if (!this.targetNode.isBpmnType('bpmn:IntermediateCatchEvent')) {
        return true;
      }

      return this.targetNode.isType('processmaker-modeler-intermediate-message-catch-event');
    },
    targetIsValidType() {
      return [
        'bpmn:Task',
        'bpmn:ScriptTask',
        'bpmn:ManualTask',
        'bpmn:CallActivity',
        'bpmn:ServiceTask',
        'bpmn:IntermediateCatchEvent',
        'bpmn:Participant',
        'bpmn:StartEvent',
      ].some(type => this.targetNode.isBpmnType(type));
    },
    hasTargetType() {
      return this.targetType != null;
    },
    targetIsNotContainingPool() {
      return this.target !== this.sourceNode.pool;
    },
    targetIsPool() {
      return this.targetType === poolId;
    },
    sourceIsPool() {
      return this.sourceType === poolId;
    },
    targetIsInDifferentPool() {
      const targetPool = this.targetIsPool() ? this.target : this.target.component.node.pool;
      const sourcePool = this.sourceIsPool() ? this.sourceShape : this.sourceShape.component.node.pool;

      return sourcePool != null && sourcePool !== targetPool;
    },
    targetIsNotSource() {
      return this.targetNode.id !== this.sourceNode.id;
    },
    allowOutgoingFlow() {
      return typeof this.sourceConfig.allowOutgoingFlow === 'undefined' ||
        this.sourceConfig.allowOutgoingFlow(this.targetNode);
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
