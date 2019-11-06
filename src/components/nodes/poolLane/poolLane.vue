<template>
  <div/>
</template>

<script>
import { shapes, util } from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import resizeConfig from '@/mixins/resizeConfig';
import { labelWidth } from '../pool/poolSizes';
import pull from 'lodash/pull';
import { poolColor } from '@/components/nodeColors';

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
  methods: {
    removeShape() {
      this.$emit('remove-node', this.node);

      const poolComponent = this.node.pool.component;
      const sortedLanes = poolComponent.sortedLanes();

      if (sortedLanes.length === 2) {
      /* Do not allow pool with only one lane;
       * if removing 2nd last lane, remove the other lane as well */
        this.$emit('remove-node', sortedLanes.filter(lane => lane !== this.shape)[0].component.node);
        return;
      }

      if (this.shape === sortedLanes[sortedLanes.length - 1]) {
        poolComponent.fillLanes(this.shape, 'top-right', true);
        return;
      }

      poolComponent.fillLanes(this.shape, 'bottom-right', true);
    },
    configureLaneInParentPool() {
      /* Ensure this runs after `configurePoolLane` in crownConfig mixin */
      const poolComponent = this.node.pool.component;
      if (!poolComponent.laneSet) {
        poolComponent.createLaneSet();
      }

      const lanes = poolComponent.laneSet.get('lanes');
      if (!lanes.includes(this.node.definition)) {
        lanes.push(this.node.definition);
      }
    },
  },
  mounted() {
    this.shape = new shapes.standard.Rectangle();

    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.set('elementMove', false);
    this.shape.attr('body/cursor', 'default');
    this.shape.attr('body', {
      fill: poolColor,
      originalFill: poolColor,
    });
    this.shape.attr('label', {
      text: util.breakText(this.node.definition.get('name'), { width: bounds.height }),
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    });

    this.shape.component = this;
    this.shape.addTo(this.graph);

    if (!this.planeElements.includes(this.node.diagram)) {
      this.planeElements.push(this.node.diagram);
    }
  },
  beforeDestroy() {
    /* Resize the parent pool to fill in the space where the lane was deleted.
     * If this was the 2nd last lane, remove all lanes and revert the pool back to normal. */

    const poolComponent = this.node.pool.component;
    const lanes = poolComponent.laneSet.get('lanes');

    pull(lanes, this.node.definition);

    if (lanes.length === 0) {
      /* Last lane being removed; remove laneSet */
      poolComponent.containingProcess.set('laneSets', []);
      poolComponent.laneSet = null;

      return;
    }
  },
};
</script>
