<template>
  <img
    class="crown-icon"
    alt="Add lane below icon"
    v-on="$listeners"
    :src="laneBelowIcon"
    data-test="lane-below-button"
    id="lane-below-button"
  >
</template>

<script>
import laneBelowIcon from '@/assets/lane-below.svg';

export default {
  data() {
    return {
      laneBelowIcon,
    };
  },
};
</script>

<style scoped>
  .crown-icon {
    width: 25px;
  }
</style>
