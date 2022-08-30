<template>
  <button
    v-on="$listeners"
    :id="id"
    :aria-label="ariaLabel"
    class="btn"
  >
    <slot>
      <img
        :src="src"
        width="width"
        height="height"
      >
    </slot>
  </button>
</template>
<script>

export default {
  props: {
    'id': String,
    'ariaLabel': String,
    'src': String,
    'width': {
      type: Number,
      default: 19,
    },
    'height': {
      type: Number,
      default: 20,
    },
  },
};
</script>

<style scoped>
.btn {
  border: none;
  padding: 0;
  margin-top: 0;
  display: flex;
}
img {
  margin: 0px 10px;
  height: 15px;
}
i {
  margin: 0px 10px;
  font-size: 15px;
}
</style>
