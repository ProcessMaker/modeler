<template>
  <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Zoom controls">
    <b-button
      class="btn btn-sm btn-secondary"
      @click="scale += scaleStep"
      data-test="zoom-in"
      v-b-tooltip.hover
      :title="$t('Zoom In')"
    >
      <font-awesome-icon :icon="plusIcon" />
    </b-button>
    <b-button
      class="btn btn-sm btn-secondary"
      @click="scale = Math.max(minimumScale, scale -= scaleStep)"
      data-test="zoom-out"
      v-b-tooltip.hover
      :title="$t('Zoom Out')"
    >
      <font-awesome-icon :icon="minusIcon" />
    </b-button>
    <b-button
      class="btn btn-sm btn-secondary"
      @click="scale = initialScale"
      :disabled="scale === initialScale"
      data-test="zoom-reset"
      v-b-tooltip.hover
      :title="$t('Reset to initial scale')"
    >
      {{ $t('Reset') }}
    </b-button>
    <span class="btn btn-sm btn-secondary scale-value">{{ Math.round(scale*100) }}%</span>
  </div>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

export default {
  name: 'zoom',
  components: {
    FontAwesomeIcon,
  },
  props: ['paperManager'],
  watch: {
    scale(scale) {
      this.paperManager.scale = scale;
      if (scale === this.initialScale) {
        this.$root.$emit('bv::hide::tooltip');
      }
    },
  },
  data() {
    return {
      plusIcon: faPlus,
      minusIcon: faMinus,
      scale: 1,
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
    };
  },
};
</script>
