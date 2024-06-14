<template>
  <div class="preview-placeholder">
    <img id="preview-image" :src="noPreviewImg" alt="no preview">
    <h1>No Resource Assigned</h1>
    <h2>This is a placeholder screen. Please, assign a resource to this task.</h2>
  </div>
</template>

<script>
import noPreviewImageIcon from '@/assets/noPreviewImage.png';

export default {
  data() {
    return {
      noPreviewImg: noPreviewImageIcon,
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
