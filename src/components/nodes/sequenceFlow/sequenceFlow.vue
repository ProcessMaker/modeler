<template>
  <div>
  </div>
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
      const targetType = get(this.target, 'component.node.type');

      if (!targetType) {
        return false;
      }

      const targetPool = this.target.component.node.pool;
      const sourcePool = this.sourceShape.component.node.pool;

      if (this.isTargetTypeALane(targetType) ||
        this.isNotSamePool(sourcePool, targetPool) ||
        this.isIncomingInvalid(this.sourceNode) ||
        this.isOutgoingInvalid(this.targetNode)) {
          return false;
      }

      return true;
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
    isIncomingInvalid(sourceNode) {
      return this.targetConfig.validateIncoming && !this.targetConfig.validateIncoming(sourceNode);
    },
    isOutgoingInvalid(targetNode) {
      return this.sourceConfig.validateOutgoing && !this.sourceConfig.validateOutgoing(targetNode);
    },
    isNotSamePool(sourcePool, targetPool) {
      return sourcePool && sourcePool !== targetPool
    },
    isTargetTypeALane(targetType) {
      return targetType === laneId;
    }
  },
  mounted() {
    this.shape = new joint.shapes.standard.Link({
      router: {
        name: 'orthogonal',
      },
    });
  },
};
</script>
