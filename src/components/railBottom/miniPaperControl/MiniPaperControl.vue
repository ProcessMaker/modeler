<template>
  <div class="mini-paper-box">
    <button type="button" class="mini-paper-button">
      <img :src="mapIcon" alt="Mini Paper" >
    </button>
  </div>
</template>

<script>

export default ({
  data() {
    return {
      mapIcon: require('@/assets/railBottom/mini-map.svg'),
    };
  },
});

</script>

<style lang="scss" scoped src="./miniPaperControl.scss"></style>
