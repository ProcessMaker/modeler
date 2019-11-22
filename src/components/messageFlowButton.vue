<template>
  <crown-button
    id="message-flow-button"
    aria-label="Create a message flow"
    @click="$emit('click')"
  >
    <img
      :src="messageFlow"
      alt=""
    >
  </crown-button>
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
