<template>
  <div class="no-preview">
    <img id="preview-asset" :src="previewAsset" alt="Preview Asset">
    <h1>The preview is loading</h1>
    <h2>Some assets can takes some time to load</h2>

    <img alt="spinner" :src="spinnerImg">
  </div>
</template>

<script>

export default {
  data() {
    return {
      previewAsset: require('@/assets/previewAsset.png'),
      spinnerImg: require('@/assets/spinner.svg'),
    };
  },
};
</script>

<style scoped>
.no-preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
}
#preview-asset {
  width: 200px;
  padding-bottom: 150px;
}

.no-preview h1 {
  text-align: center;
  font-weight: bold;
  font-size: xx-large;
  margin-bottom: 50px;
}

.no-preview h2 {
  text-align: center;
  font-size: x-large;
  margin-bottom: 50px;
}
</style>
