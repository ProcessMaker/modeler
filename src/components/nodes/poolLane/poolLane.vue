<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import resizeConfig from '@/mixins/resizeConfig';
import { labelWidth } from '../pool/poolSizes';

export default {
  props: ['graph', 'node', 'nodes', 'id', 'collaboration'],
  mixins: [crownConfig, resizeConfig],
  data() {
    return {
      shape: null,
      definition: null,
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    this.shape = new joint.shapes.standard.Rectangle();

    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.attr('body/cursor', 'default');
    this.shape.attr('label', {
      text: joint.util.breakText(this.node.definition.get('name'), { width: bounds.height }),
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    });

    this.shape.component = this;
    this.shape.addTo(this.graph);
  },
  beforeDestroy() {
    /* Resize the parent pool to fill in the space where the lane was deleted.
     * If this was the 2nd last lane, remove all lanes and rever the pool back to normal. */

    const sortedLanes = this.node.pool.component.sortedLanes();

    if (sortedLanes.length === 1) {
      /* Last lane being removed; nothing else to do */
      return;
    }

    if (sortedLanes.length === 2) {
      /* Do not allow pool with only one lane;
       * if removing 2nd last lane, remove the other lane as well */
      this.$emit('remove-node', sortedLanes.filter(lane => lane !== this.shape)[0].component.node);
      return;
    }

    if (this.shape === sortedLanes[sortedLanes.length - 1]) {
      this.node.pool.component.fillLanes(this.shape, 'top-right', true);
      return;
    }

    this.node.pool.component.fillLanes(this.shape, 'bottom-right', true);
  },
};
</script>
