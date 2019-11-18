<template>
  <img
    class="crown-icon"
    alt="Add lane above icon"
    v-on="$listeners"
    :src="laneAboveIcon"
    data-test="lane-above-button"
    id="lane-above-button"
  >
</template>

<script>
import laneAboveIcon from '@/assets/lane-above.svg';

export default {
  data() {
    return {
      laneAboveIcon,
    };
  },
};
</script>

<style scoped>
  .crown-icon {
    width: 25px;
  }
</style>
