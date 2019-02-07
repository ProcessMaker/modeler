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
      // source is valid
      // has a target
      // target is not a lane
      // target is valid
      // target is in the same pool

      return this.isValidTarget() && ! (this.isTargetTypeALane() ||
        this.isNotSamePool() ||
        this.isIncomingInvalid() ||
        this.isOutgoingInvalid());;
    },
    targetType() {
      return get(this.target, 'component.node.type');
    }
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
    isValidTarget() {
      return this.hasTargetType();
    },
    isIncomingInvalid() {
      return this.targetConfig.validateIncoming && !this.targetConfig.validateIncoming(this.sourceNode);
    },
    isOutgoingInvalid() {
      return this.sourceConfig.validateOutgoing && !this.sourceConfig.validateOutgoing(this.targetNode);
    },
    isNotSamePool() {
      const targetPool = this.target.component.node.pool;
      const sourcePool = this.sourceShape.component.node.pool;

      return sourcePool && sourcePool !== targetPool
    },
    hasTargetType() {
      return !!this.targetType;
    },
    isTargetTypeALane() {
      return this.targetType === laneId;
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
