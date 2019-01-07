<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import resizeConfig from '@/mixins/resizeConfig';
import { labelWidth } from '../pool/poolSizes';
import pull from 'lodash/pull';
import store from '@/store';

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
      store.commit('startBatchAction');
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
  },
  mounted() {
    this.shape = new joint.shapes.standard.Rectangle();

    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.set('elementMove', false);
    this.shape.attr('body/cursor', 'default');
    this.shape.attr('label', {
      text: joint.util.breakText(this.node.definition.get('name'), { width: bounds.height }),
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    });

    this.shape.component = this;
    this.shape.addTo(this.graph);

    const poolComponent = this.node.pool.component;
    if (!poolComponent.laneSet) {
      poolComponent.createLaneSet();
    }

    const lanes = poolComponent.laneSet.get('lanes');
    if (!lanes.includes(this.node.definition)) {
      lanes.push(this.node.definition);
    }

    if (!this.planeElements.includes(this.node.diagram)) {
      this.planeElements.push(this.node.diagram);
    }
  },
  beforeDestroy() {
    /* Resize the parent pool to fill in the space where the lane was deleted.
     * If this was the 2nd last lane, remove all lanes and rever the pool back to normal. */

    const poolComponent = this.node.pool.component;
    const sortedLanes = poolComponent.sortedLanes();

    pull(poolComponent.laneSet.get('lanes'), this.node.definition);

    if (sortedLanes.length === 1) {
      /* Last lane being removed; remove laneSet */
      poolComponent.containingProcess.set('laneSets', []);
      poolComponent.laneSet = null;

      return;
    }
  },
};
</script>
