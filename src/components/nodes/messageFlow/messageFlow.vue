<template>
  <div/>
</template>

<script>
import { shapes } from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import linkConfig from '@/mixins/linkConfig';
import get from 'lodash/get';
import { id as laneId } from '../poolLane';
import { id as poolId } from '../pool';

export default {
  props: ['graph', 'node', 'id', 'moddle', 'nodeRegistry'],
  mixins: [crownConfig, linkConfig],
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
  },
  methods: {
    updateRouter() {
      this.shape.router('orthogonal');
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();
      this.node.definition.targetRef = targetShape.component.node.definition;
    },
    isValidTarget() {
      return this.hasTargetType() &&
        this.targetIsNotALane() &&
        this.targetIsNotContainingPool() &&
        this.targetIsInDifferentPool() &&
        this.targetIsNotSource() &&
        this.validateOutgoing();
    },
    isValidTargetType(type) {
      return [
        'bpmn:Task', 
        'bpmn:ScriptTask', 
        'bpmn:ManualTask',
        'bpmn:CallActivity',
        'bpmn:ServiceTask',
        'bpmn:IntermediateCatchEvent',
      ].includes(type);
    },
    hasTargetType() {
      return this.targetType != null;
    },
    targetIsNotALane() {
      return this.targetType !== laneId;
    },
    targetIsNotContainingPool() {
      return this.target !== this.sourceNode.pool;
    },
    targetIsPool() {
      return this.targetType === poolId;
    },
    targetIsInDifferentPool() {
      if (this.targetIsPool()) {
        return true;
      }

      const targetNodeType = this.targetNode.definition.$type;
      if (this.isValidTargetType(targetNodeType)) {
        return true;
      }

      const targetPool = this.target.component.node.pool;
      const sourcePool = this.sourceShape.component.node.pool;

      return sourcePool != null && sourcePool !== targetPool;
    },
    targetIsNotSource() {
      return this.targetNode.definition.id !== this.sourceNode.definition.id;
    },
    validateOutgoing() {
      return typeof this.sourceConfig.validateOutgoing === 'undefined' ||
        this.sourceConfig.validateOutgoing(this.targetNode);
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
