<template>
  <div class="preview-placeholder">
    <img id="preview-image" :src="noPreviewImg" alt="no preview">
    <h1>No Resource Assigned</h1>
    <h2>This is a placeholder screen. Please, assign a resource to this task.</h2>
  </div>
</template>

<script>

export default {
  data() {
    return {
      noPreviewImg: require('@/assets/noPreviewImage.png'),
    };
  },
};
</script>


<style lang="scss" src="./preview_panel.scss" scoped />

<style scoped>
  #preview-image {
    width: 200px;
    margin-top:50px;
    margin-bottom: 50px;
  }
</style>
