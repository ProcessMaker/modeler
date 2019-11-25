<template>
  <crown-button
    id="lane-above-button"
    aria-label="Add lane above icon"
    :src="laneAboveIcon"
    v-on="$listeners"
    :width="25"
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
