<template>
  <div class="zoom-box">
    <div
      class="zoom-button"
      data-test="zoom-out"
      @click="paperManager.scale = Math.max(minimumScale, paperManager.scale.sx -= scaleStep)"
      v-b-tooltip.hover
      :title="$t('Zoom Out')"
    >
      <img :src="minusIcon" alt="Zoom Out" >
    </div>

    <div v-if="paperManager" class="zoom-text">
      {{ Math.round(paperManager.scale.sx*100) }}%
    </div>

    <div
      class="zoom-button"
      data-test="zoom-in"
      @click="paperManager.scale = paperManager.scale.sx + scaleStep"
      v-b-tooltip.hover
      :title="$t('Zoom In')"
    >
      <img :src="plusIcon" alt="Zoom In" >
    </div>
  </div>
</template>

<script>
export default ({
  props: {
    paperManager: {},
  },
  data() {
    return {
      minusIcon: require('@/assets/railBottom/dash-lg.svg'),
      plusIcon: require('@/assets/railBottom/plus-lg.svg'),
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
    };
  },
});

</script>

<style lang="scss" scoped src="./zoomControl.scss"></style>
