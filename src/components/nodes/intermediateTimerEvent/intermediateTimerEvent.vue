<template>
  <div/>
</template>

<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import clockIcon from '@/assets/intermediate-clock.svg';

export default {
  extends: IntermediateEvent,
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);
  },
};
</script>
