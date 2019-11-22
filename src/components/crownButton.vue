<template>
  <button
    @click="$emit('click')"
    :id="id"
    :aria-label="ariaLabel"
  >
    <slot/>
  </button>
</template>
<script>

export default {
  props: ['id', 'ariaLabel'],
};
</script>

<style scoped>
button {
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
