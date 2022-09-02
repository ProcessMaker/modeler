<template>
  <crown-button id="lane-below-button" aria-label="Add lane below icon" :src="laneBelowIcon" :width="25" v-on="$listeners" />
</template>

<script>
import laneBelowIcon from "!!svg-inline-loader!@/assets/lane-below.svg";
import CrownButton from "@/components/crown/crownButtons/crownButton.vue";

export default {
  components: { CrownButton },
  data() {
    return {
      laneBelowIcon
    };
  }
};
</script>
