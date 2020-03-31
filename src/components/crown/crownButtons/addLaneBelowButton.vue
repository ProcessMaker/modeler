<template>
  <crown-button
    id="lane-below-button"
    aria-label="Add lane below icon"
    :src="laneBelowIcon"
    v-on="$listeners"
    :width="25"
  />
</template>

<script>
import laneBelowIcon from '@/assets/lane-below.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';

export default {
  components: { CrownButton },
  data() {
    return {
      laneBelowIcon,
    };
  },
};
</script>
