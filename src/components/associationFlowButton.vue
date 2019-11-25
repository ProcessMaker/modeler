<template>
  <crown-button
    id="association-flow-button"
    aria-label="Add association flow"
    :src="connectIcon"
    v-on="$listeners"
  />
</template>

<script>
import connectIcon from '@/assets/connect-artifacts.svg';
import CrownButton from '@/components/crownButton';

export default {
  components: { CrownButton },
  data() {
    return {
      connectIcon,
    };
  },
};
</script>
