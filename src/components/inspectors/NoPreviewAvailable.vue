<template>
  <div class="no-preview">
    <img :src="noPreviewImg">
    <h1>No Screen Asigned</h1>
    <h2>This is a placeholder screen. Please, assign a screen to this task.</h2>
  </div>
</template>

<script>

export default {
  props: [],
  data() {
    return {
      noPreviewImg: require('@/assets/noPreviewImage.png'),
    };
  },
  methods: {

  },
};
</script>

<style scoped>
.no-preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #44494E;
  padding: 5px;
}

.no-preview img {
  max-width: 50%;
  width: auto;
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
}
</style>
