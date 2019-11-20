<template>
  <img
    :src="messageFlow"
    @click="$emit('click')"
    id="message-flow-button"
    data-test="message-flow-button"
    width="19"
    height="20"
    alt="Create a message flow"
  >

</template>
<script>
import messageFlow from '@/assets/message-flow.svg';

export default {
  data() {
    return {
      messageFlow,
    };
  },
};
</script>
