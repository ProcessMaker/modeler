<template>
  <crown-button id="lane-above-button" aria-label="Add lane above icon" :src="laneAboveIcon" :width="25" v-on="$listeners" />
</template>

<script>
import laneAboveIcon from "@/assets/lane-above.svg";
import CrownButton from "@/components/crown/crownButtons/crownButton";

export default {
  components: { CrownButton },
  data() {
    return {
      laneAboveIcon
    };
  }
};
</script>
