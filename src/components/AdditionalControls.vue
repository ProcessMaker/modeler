<template>
  <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Additional controls">
    <b-button
      class="btn btn-sm btn-secondary ml-auto"
      data-test="panels-btn"
      @click="panelsCompressed = !panelsCompressed"
      v-b-tooltip.hover
      :title="panelsCompressed ? $t('Show Menus') : $t('Hide Menus')"
    >
      <font-awesome-icon :icon="panelsCompressed ? expandIcon : compressIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary mini-map-btn ml-auto"
      data-test="mini-map-btn"
      @click="miniMapOpen = !miniMapOpen"
      v-b-tooltip.hover
      :title="miniMapOpen ? $t('Hide Mini-Map') : $t('Show Mini-Map')"
    >
      <font-awesome-icon :icon="miniMapOpen ? minusIcon : mapIcon" />
    </b-button>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCompress, faExpand, faMapMarked, faMinus } from '@fortawesome/free-solid-svg-icons';

export default {
  name: 'additional-controls',
  components: {
    FontAwesomeIcon,
  },
  watch: {
    miniMapOpen(isOpen) {
      this.$emit('mini-map-is-open', isOpen);
    },
    panelsCompressed(isCompressed) {
      this.$emit('panels-changed', isCompressed);
    },
  },
  data() {
    return {
      mapIcon: faMapMarked,
      miniMapOpen: false,
      minusIcon: faMinus,
      compressIcon: faCompress,
      expandIcon: faExpand,
      panelsCompressed: false,
    };
  },
};
</script>
<style lang="scss">
@import '~jointjs/dist/joint.min.css';

$cursors: default, not-allowed, wait;
$controls-column-max-width: 265px;
$controls-column-compressed-max-width: 95px;
$toolbar-height: 2rem;
$vertex-error-color: #ED4757;
$controls-transition: 0.3s;

</style>
