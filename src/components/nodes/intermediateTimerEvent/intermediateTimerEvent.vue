<template>
  <div>
  </div>
</template>

<script>
import IntermediateEventComponent from '@/components/nodes/intermediateEvent/intermediateEvent';
import clockIcon from '@/assets/intermediate-clock.svg';

export default {
  extends: IntermediateEventComponent,
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);
  },
};
</script>
