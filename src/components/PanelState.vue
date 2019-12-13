<template>
  <b-button
    class="btn btn-sm btn-secondary ml-auto"
    data-test="panels-btn"
    @click="panelsCompressed = !panelsCompressed"
    v-b-tooltip.hover
    :title="panelsCompressed ? $t('Show Menus') : $t('Hide Menus')"
  >
    <font-awesome-icon :icon="panelsCompressed ? expandIcon : compressIcon" />
  </b-button>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCompress, faExpand } from '@fortawesome/free-solid-svg-icons';

export default {
  name: 'panel-state',
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      compressIcon: faCompress,
      expandIcon: faExpand,
      panelsCompressed: false,
    };
  },
  watch: {
    panelsCompressed(isCompressed) {
      this.$emit('panels-changed', isCompressed);
    },
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
