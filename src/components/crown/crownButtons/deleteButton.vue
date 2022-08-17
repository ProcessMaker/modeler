<template>
  <crown-button
    :title="$t('Delete')"
    role="menuitem"
    id="delete-button"
    aria-label="Delete this node"
    @click="isPoolLane ? removePoolLaneShape() : removeShape()"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
  >
    <img
      :src="trashIcon"
      aria-hidden="true"
      data-prefix="fas"
      data-icon="trash-alt"
      class="fa-trash-alt trash-icon"
    >
  </crown-button>
</template>

<script>
import trashIcon from '@/assets/trash-alt-solid.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import { removeFlows } from '@/components/crown/utils.js';

export default {
  components: { CrownButton },
  props: { graph: Object, shape: Object, node: Object },
  data() {
    return {
      trashIcon,
    };
  },
  computed: {
    isPoolLane() {
      return this.node.type === 'processmaker-modeler-lane';
    },
  },
  methods: {
    removeFlows,
    removeShape() {
      // @todo this should be handled by the Modeler.vue
      this.removeFlows(this.graph, this.shape);
      this.$emit('remove-node', this.node);
    },
    removePoolLaneShape() {
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
};
</script>