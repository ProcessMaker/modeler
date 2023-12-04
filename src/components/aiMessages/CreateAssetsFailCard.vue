<template>
  <div class="customAlert mx-auto mt-2">
    <b-alert show dismissible variant="warning">
      {{ $t("Generation of assets was not able to complete. Try again") }}
    </b-alert>
  </div>
</template>
<script>
export default {
  name: 'CreateAssetsFailCard',
  data() {
    return {};
  },
};
</script>
<style scoped>
.customAlert {
  word-wrap: break-word;
  position: absolute;
  display: flex;
  align-items: center;
  left: 0;
  right: 0;
  z-index: 1;
  width: 600px;
}
</style>
