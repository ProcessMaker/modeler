<template>
  <div/>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import linkConfig from '@/mixins/linkConfig';
import get from 'lodash/get';
import { id as laneId } from '../poolLane';

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
      return this.isValidTarget() && this.isValidSource();
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
      this.sourceShape.component.node.definition.get('outgoing').push(this.node.definition);
      targetShape.component.node.definition.get('incoming').push(this.node.definition);
    },
    isValidSource() {
      return this.validateIncoming();
    },
    validateIncoming() {
      return typeof this.targetConfig.validateIncoming === 'undefined' ||
        this.targetConfig.validateIncoming(this.sourceNode);
    },
    isValidTarget() {
      return this.hasTargetType() &&
        this.targetIsNotALane() &&
        this.targetIsInSamePool() &&
        this.targetIsNotSource() &&
        this.validateOutgoing();
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
      return this.targetNode.definition.id !== this.sourceNode.definition.id;
    },
    validateOutgoing() {
      return typeof this.sourceConfig.validateOutgoing === 'undefined' ||
        this.sourceConfig.validateOutgoing(this.targetNode);
    },
  },
  mounted() {
    this.shape = new joint.shapes.standard.Link({
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
  },
};
</script>
