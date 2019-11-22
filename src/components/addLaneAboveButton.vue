<template>
  <crown-button
    id="lane-above-button"
    aria-label="Add lane above icon"
    :src="laneAboveIcon"
    v-on="$listeners"
  />
</template>

<script>
import laneAboveIcon from '@/assets/lane-above.svg';
import CrownButton from '@/components/crownButton';

export default {
  components: { CrownButton },
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
