<template>
  <crown-button
    id="lane-below-button"
    aria-label="Add lane below icon"
    v-on="$listeners"
    :width="25"
  >
    <img
      :src="laneBelowIcon"
      aria-hidden="true"
    >
  </crown-button>
</template>

<script>
import laneBelowIcon from "!!svg-inline-loader!@/assets/lane-below.svg";
import CrownButton from "@/components/crown/crownButtons/crownButton.vue";

export default {
  components: { CrownButton },
  data() {
    return {
      laneBelowIcon,
    };
  },
};
</script>

