<template>
  <crown-button id="lane-below-button" aria-label="Add lane below icon" :src="laneBelowIcon" :width="25" v-on="$listeners" />
</template>

<script>
import laneBelowIcon from "@/assets/lane-below.svg";
import CrownButton from "@/components/crown/crownButtons/crownButton";

export default {
  components: { CrownButton },
  data() {
    return {
      laneBelowIcon
    };
  }
};
</script>
