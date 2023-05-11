<template>
  <button
    v-on="$listeners"
    :id="id"
    :aria-label="ariaLabel"
    class="crown-button"
  >
    <slot>
      <img
        :src="src"
        width="width"
        height="height"
        class="crown-icon"
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

<style lang="scss" scoped>
.crown-button {
  border:none;
  display: flex;
  background-color: $primary-white;
  border-radius: 4px;
  color: $crown-icon-neutral;
  width: 35px;
  height: 35px;
  font-size: 20px;
  padding: 4px;
}
.crown-button:hover {
  background-color: $crown-icon-hover-bg;
  color: $crown-icon-neutral;
}
.crown-button:active {
  background-color: $cronw-icon-active-bg;
  color: $crown-icon-active;
}

.crown-button:focus {
  background-color: #DEEBFF;
  color: $crown-icon-active;
}

img {
  margin: 0px 5px;
  height: 20px;
  width: 20px;
  padding:2px;
  fill: #5faaee;
}
.crown-button svg {
  margin:auto;
}
.crown-button i {
  margin:auto;
}
</style>
