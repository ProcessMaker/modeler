<template>
  <div class="preview-placeholder">
    <img id="preview-image" :src="previewAsset" alt="Preview Asset">
    <h1>The preview is loading</h1>
    <h2>Some assets can take some time to load</h2>

    <img alt="spinner" :src="spinnerImg">
  </div>
</template>

<script>
import previewAsset from '@/assets/previewAsset.png';
import spinnerImg from '@/assets/spinner.svg';

export default {
  data() {
    return {
      previewAsset,
      spinnerImg,
    };
  },
};
</script>

<style lang="scss" src="./preview_panel.scss" scoped />

<style scoped>
  #preview-image {
    width: 130px;
    margin-top: 50px;
    margin-bottom: 50px;
  }
</style>
