<template>
  <div class="btn-group btn-group-sm mr-2" role="group">
    <b-button
      class="btn btn-sm btn-secondary btn-align-left"
      data-test="align-left"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.left"
      :title="$t('Align Left')"
      @click="selectedShapes.align.left"
    >
      <font-awesome-icon :icon="alignLeftIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-center"
      data-test="align-center"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.horizontalCenter"
      :title="$t('Center Horizontally')"
      @click="selectedShapes.align.horizontalCenter"
    >
      <font-awesome-icon :icon="alignCenterIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-right"
      data-test="align-right"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.right"
      :title="$t('Align Right')"
      @click="selectedShapes.align.right"
    >
      <font-awesome-icon :icon="alignRightIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-bottom"
      data-test="align-bottom"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.bottom"
      :title="$t('Align Bottom')"
      @click="selectedShapes.align.bottom"
    >
      <font-awesome-icon :icon="alignRightIcon" class="rotate-90-degrees-right" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-vertical-center"
      data-test="align-vertical-center"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.verticalCenter"
      :title="$t('Center Vertically')"
      @click="selectedShapes.align.verticalCenter"
    >
      <font-awesome-icon :icon="alignCenterIcon" class="rotate-90-degrees-right" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-top"
      data-test="align-top"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.top"
      :title="$t('Align Top')"
      @click="selectedShapes.align.top"
    >
      <font-awesome-icon :icon="alignLeftIcon" class="rotate-90-degrees-right" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-distribute-horizontal"
      data-test="distribute-horizontal"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.distribute.horizontally"
      :title="$t('Distribute Horizontally')"
      @click="selectedShapes.distribute.horizontally"
    >
      H
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-distribute-vertical"
      data-test="distribute-vertical"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.distribute.vertically"
      :title="$t('Distribute Vertically')"
      @click="selectedShapes.distribute.vertically"
    >
      V
    </b-button>
  </div>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faAlignCenter, faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons';
import store from '@/store';
import { getShapesOptions } from '@/components/nodes/utilities/shapeGroup';

export default {
  components: { FontAwesomeIcon },
  data() {
    return {
      alignCenterIcon: faAlignCenter,
      alignLeftIcon: faAlignLeft,
      alignRightIcon: faAlignRight,
    };
  },
  computed: {
    selectedShapes() {
      return getShapesOptions(store.getters.highlightedShapes);
    },
  },
  watch: {
    selectedShapes() {
      this.$root.$emit('bv::hide::tooltip');
    },
  },
};
</script>

<style lang="scss" src="./alignButtons.scss" />
