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
import { namePosition } from './sequenceFlowConfig';
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
    defaultFlow: {
      get() {
        return this.shape.attr('line').sourceMarker['stroke-width'] > 0;
      },
      set(value) {
        this.shape.attr('line', {
          sourceMarker: {
            'stroke-width': value ? 2 : 0,
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
        this.defaultFlow = this.isDefaultFlow();
      },
      deep: true,
    },
    'node.definition.sourceRef': {
      handler() {
        this.defaultFlow = this.isDefaultFlow();
      },
      deep: true,
    },
  },
  methods: {
    isDefaultFlow() {
      return this.node.definition.sourceRef
        && this.node.definition.sourceRef.default
        && this.node.definition.sourceRef.default.id === this.node.definition.id;
    },
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
    createLabel() {
      this.shape.labels([{
        attrs: {
          text: {
            text: this.shapeName,
          },
        },
        position: namePosition,
      }]);
    },
    createDefaultFlowMarker() {
      const isDefault = this.isDefaultFlow();
      this.shape.attr('line', {
        sourceMarker: {
          'type': 'polyline',
          'stroke-width': isDefault ? 2 : 0,
          points: '2,6 6,-6',
        },
      });
    },
  },
  mounted() {
    this.shape = new shapes.standard.Link();
    this.shape.connector('rounded', { radius: 5 });
    this.createLabel();
    this.createDefaultFlowMarker();

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
