<template>
  <img
    :src="sequenceFlow"
    @click="$emit('click')"
    id="sequence-flow-button"
    data-test="sequence-flow-button"
    width="19px"
    height="20px"
    alt="Create a sequence flow"
  >
</template>
<script>
import sequenceFlow from '@/assets/connect-elements.svg';

export default {
  data() {
    return {
      sequenceFlow,
    };
  },
};
</script>
