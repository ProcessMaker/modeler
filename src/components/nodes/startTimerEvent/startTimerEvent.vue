<template>
  <div/>
</template>

<script>
import StartEvent from '@/components/nodes/startEvent/startEvent';
import clockIcon from '@/assets/clock.svg';

export default {
  extends: StartEvent,
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);
  },
};
</script>
