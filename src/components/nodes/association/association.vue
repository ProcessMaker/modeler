<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import linkConfig from '@/mixins/linkConfig';
import get from 'lodash/get';

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

      /* If the link source is part of a pool, only allow sequence
       * flows to the target if the target is also in the same pool  */
      if (sourcePool && sourcePool !== targetPool) {
        return false;
      }
      const invalidIncoming = this.targetConfig.validateAssociationIncoming
        && !this.targetConfig.validateAssociationIncoming(this.sourceNode);

      const invalidOutgoing = this.sourceConfig.validateAssociationOutgoing
        && !this.sourceConfig.validateAssociationOutgoing(this.targetNode);

      if (invalidIncoming || invalidOutgoing) {
        return false;
      }

      return true;
    },
  },
  methods: {
    updateRouter() {
      this.shape.router('normal', { elementPadding: this.elementPadding });
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();
      this.node.definition.targetRef = targetShape.component.node.definition;
    },
  },
  mounted() {
    this.shape = new joint.shapes.standard.Link({ router: { name: 'normal' } });
    this.shape.attr({
      line: {
        stroke: 'black',
        strokeWidth: '4',
        strokeLinecap: 'round',
        strokeDasharray: '1, 8',
        strokeDashoffset: '5',
        targetMarker: {
          'type': 'rect',
          'width': 1,
          'height': 1,
          'stroke': 'none',
        },
      },
    });
  },
};
</script>
