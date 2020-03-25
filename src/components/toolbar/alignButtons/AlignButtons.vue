<template>
  <div class="btn-group btn-group-sm mr-2" role="group">
    <b-button
      class="btn btn-sm btn-secondary btn-align-left"
      data-test="align-left"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.left"
      :title="$t('Align Left')"
      @click="undoableAction(selectedShapes.align.left)"
    >
      <font-awesome-icon :icon="alignLeftIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-center"
      data-test="align-center"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.horizontalCenter"
      :title="$t('Center Horizontally')"
      @click="undoableAction(selectedShapes.align.horizontalCenter)"
    >
      <font-awesome-icon :icon="alignCenterIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-right mr-1"
      data-test="align-right"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.right"
      :title="$t('Align Right')"
      @click="undoableAction(selectedShapes.align.right)"
    >
      <font-awesome-icon :icon="alignRightIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-bottom"
      data-test="align-bottom"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.bottom"
      :title="$t('Align Bottom')"
      @click="undoableAction(selectedShapes.align.bottom)"
    >
      <font-awesome-icon :icon="alignRightIcon" class="rotate-90-degrees-right" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-vertical-center"
      data-test="align-vertical-center"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.verticalCenter"
      :title="$t('Center Vertically')"
      @click="undoableAction(selectedShapes.align.verticalCenter)"
    >
      <font-awesome-icon :icon="alignCenterIcon" class="rotate-90-degrees-right" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-align-top mr-1"
      data-test="align-top"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.align.top"
      :title="$t('Align Top')"
      @click="undoableAction(selectedShapes.align.top)"
    >
      <font-awesome-icon :icon="alignLeftIcon" class="rotate-90-degrees-right" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-distribute-horizontal d-flex align-items-center"
      data-test="distribute-horizontal"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.distribute.horizontally"
      :title="$t('Distribute Horizontally')"
      @click="undoableAction(selectedShapes.distribute.horizontally)"
    >
      <img
        :src="distHIcon"
        alt=""
        height="16"
      >
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-distribute-vertical d-flex align-items-center"
      data-test="distribute-vertical"
      v-b-tooltip.hover
      :disabled="!selectedShapes.can.distribute.vertically"
      :title="$t('Distribute Vertically')"
      @click="undoableAction(selectedShapes.distribute.vertically)"
    >
      <img
        :src="distVIcon"
        alt=""
        height="16"
      >
    </b-button>
  </div>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faAlignCenter, faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons';
import store from '@/store';
import { getShapesOptions } from '@/components/nodes/utilities/shapeGroup';
import distributeHorizontallyIcon from '@/assets/distribute-horizontally-icon.svg';
import distributeVerticallyIcon from '@/assets/distribute-vertically-icon.svg';


export default {
  components: { FontAwesomeIcon },
  data() {
    return {
      alignCenterIcon: faAlignCenter,
      alignLeftIcon: faAlignLeft,
      alignRightIcon: faAlignRight,
      distHIcon: distributeHorizontallyIcon,
      distVIcon: distributeVerticallyIcon,
    };
  },
  methods: {
    undoableAction(actionFn) {
      actionFn();
      this.$emit('save-state');
    },
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
