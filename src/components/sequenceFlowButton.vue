<template>
  <crown-button
    id="sequence-flow-button"
    aria-label="Create a sequence flow"
    @click="$emit('click')"
  >
    <img
      :src="sequenceFlow"
      alt=""
      role="presentation"
    >
  </crown-button>
</template>
<script>
import sequenceFlow from '@/assets/connect-elements.svg';
import CrownButton from '@/components/crownButton';

export default {
  components: { CrownButton },
  data() {
    return {
      sequenceFlow,
    };
  },
};
</script>
