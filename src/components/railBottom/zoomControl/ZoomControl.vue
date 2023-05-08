<template>
  <div class="zoom-box">
    <button
      type="button"
      class="zoom-button"
      data-test="zoom-out"
      @click="paperManager.scale = Math.max(minimumScale, paperManager.scale.sx -= scaleStep)"
      v-b-tooltip.hover
      :title="$t('Zoom Out')"
    >
      <MinusIcon />
    </button>

    <div v-if="paperManager" class="zoom-text">
      {{ Math.round(paperManager.scale.sx*100) }}%
    </div>

    <button
      type="button"
      class="zoom-button"
      data-test="zoom-in"
      @click="paperManager.scale = paperManager.scale.sx + scaleStep"
      v-b-tooltip.hover
      :title="$t('Zoom In')"
    >
      <PlusIcon />
    </button>
  </div>
</template>

<script>
import { MinusIcon, PlusIcon } from '@/components/railBottom/icons';

export default ({
  components: {
    MinusIcon,
    PlusIcon,
  },
  props: {
    paperManager: {},
  },
  data() {
    return {
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
    };
  },
});

</script>

<style lang="scss" scoped src="./zoomControl.scss"></style>
