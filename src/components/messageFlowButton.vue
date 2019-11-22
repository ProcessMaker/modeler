<template>
  <crown-button
    id="message-flow-button"
    aria-label="Create a message flow"
    :src="messageFlow"
    v-on="$listeners"
  />
</template>
<script>
import messageFlow from '@/assets/message-flow.svg';
import CrownButton from '@/components/crownButton';

export default {
  components: { CrownButton },
  data() {
    return {
      messageFlow,
    };
  },
};
</script>
