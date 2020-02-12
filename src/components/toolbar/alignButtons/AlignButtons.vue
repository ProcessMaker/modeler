<template>
  <div class="btn-group btn-group-sm mr-2" role="group">
    <b-button
      class="btn btn-sm btn-secondary btn-align-left"
      data-test="align-left"
      v-b-tooltip.hover
      :disabled="!canAlignLeft"
      :title="$t('Align Left')"
      @click="alignLeft"
    >
      <font-awesome-icon :icon="alignLeftIcon" />
    </b-button>
    <b-button
      class="btn btn-sm btn-secondary btn-align-center"
      data-test="align-center"
      v-b-tooltip.hover
      :disabled="!canAlignCenter"
      :title="$t('Align Center')"
      @click="alignCenter"
    >
      <font-awesome-icon :icon="alignCenterIcon" />
    </b-button>
    <b-button
      class="btn btn-sm btn-secondary btn-align-rigth"
      data-test="align-right"
      v-b-tooltip.hover
      :disabled="!canAlignRight"
      :title="$t('Align Right')"
      @click="alignRight"
    >
      <font-awesome-icon :icon="alignRightIcon" />
    </b-button>
  </div>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faAlignCenter, faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons';
import store from '@/store';
import { alignLeft, alignRight, centerHorizontally } from '@/components/nodes/utilities/align';
import { getBoundingBox } from '@/components/nodes/utilities/shapeGroup';
import { shapeCenterX, shapeLeft, shapeRight } from '@/components/nodes/utilities/shapeMetrics';

export default {
  components: { FontAwesomeIcon },
  data() {
    return {
      alignCenterIcon: faAlignCenter,
      alignLeftIcon: faAlignLeft,
      alignRightIcon: faAlignRight,
    };
  },
  methods: {
    align(directionFn) {
      const highlightedShapes = store.getters.highlightedShapes;
      directionFn(highlightedShapes);
      this.$root.$emit('bv::hide::tooltip');
    },
    alignLeft() {
      this.align(alignLeft);
    },
    alignCenter() {
      this.align(centerHorizontally);
    },
    alignRight() {
      this.align(alignRight);
    },
  },
  computed: {
    canAlign() {
      return store.getters.highlightedShapes && store.getters.highlightedShapes.length > 1;
    },
    canAlignLeft() {
      const highlightedShapes = store.getters.highlightedShapes;
      const bounds = getBoundingBox(highlightedShapes);
      return this.canAlign && highlightedShapes.some(shape => shapeLeft(shape) != bounds.left);
    },
    canAlignCenter() {
      const highlightedShapes = store.getters.highlightedShapes;
      const bounds = getBoundingBox(highlightedShapes);
      return this.canAlign && highlightedShapes.some(shape => shapeCenterX(shape) != bounds.hMiddle);
    },
    canAlignRight() {
      const highlightedShapes = store.getters.highlightedShapes;
      const bounds = getBoundingBox(highlightedShapes);
      return this.canAlign && highlightedShapes.some(shape => shapeRight(shape) != bounds.right);
    },
  },
};
</script>
