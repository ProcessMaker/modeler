<template>
  <img
    v-on="$listeners"
    :src="connectIcon"
    data-test="message-flow-button"
    id="association-flow-button"
  >
</template>

<script>
import connectIcon from '@/assets/connect-artifacts.svg';

export default {
  data() {
    return {
      connectIcon,
    };
  },
};
</script>
