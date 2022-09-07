<template>
  <crown-button id="lane-above-button" aria-label="Add lane above icon" v-on="$listeners" :width="25">
    <img
      :src="laneAboveIcon"
      aria-hidden="true"
    >
  </crown-button>
</template>

<script>
import laneAboveIcon from "!!svg-inline-loader!@/assets/lane-above.svg";
import CrownButton from "@/components/crown/crownButtons/crownButton.vue";

export default {
  components: { CrownButton },
  data() {
    return {
      laneAboveIcon,
    };
  },
};
</script>
