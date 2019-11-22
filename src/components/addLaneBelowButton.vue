<template>
  <crown-button
    id="lane-below-button"
    aria-label="Add lane below icon"
    :src="laneBelowIcon"
    v-on="$listeners"
  />
</template>

<script>
import laneBelowIcon from '@/assets/lane-below.svg';
import CrownButton from '@/components/crownButton';

export default {
  components: { CrownButton },
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
