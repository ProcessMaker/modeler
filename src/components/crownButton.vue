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
        alt=""
      >
    </slot>
  </button>
</template>
<script>

export default {
  props: ['id', 'ariaLabel', 'src'],
};
</script>

<style scoped>
.btn {
  border: none;
  padding: 0;
  margin-top: 0;
}
img {
  margin: 5px 10px;
  font-size: 1rem;
  width: 19px;
  height: 20px;
}
</style>
