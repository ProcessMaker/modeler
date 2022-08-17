<template>
  <crown-button
    id="lane-above-button"
    aria-label="Add lane above icon"
    v-on="$listeners"
    :width="25"
  >
    <img
      :src="laneAboveIcon"
      aria-hidden="true"
      class="lane-above-icon"
    >
  </crown-button>
</template>

<script>
import laneAboveIcon from '@/assets/lane-above.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';

export default {
  components: { CrownButton },
  data() {
    return {
      laneAboveIcon,
    };
  },
};
</script>
<style>
  .lane-above-icon {
    height: 15px;
  }
</style>
