<template>
  <div class="zoom-box">
    <div
      class="zoom-button"
      data-test="zoom-out"
    >
      <img :src="minusIcon" :alt="$t('Zoom Out')" >
    </div>

    <div class="zoom-text">100%</div>

    <div
      class="zoom-button"
      data-test="zoom-in"
    >
      <img :src="plusIcon" :alt="$t('Zoom In')" >
    </div>
  </div>
</template>

<script>

export default ({
  data() {
    return {
      minusIcon: require('@/assets/railBottom/dash-lg.svg'),
      plusIcon: require('@/assets/railBottom/plus-lg.svg'),
    };
  },
});

</script>

<style lang="scss" scoped src="./zoomControl.scss"></style>
