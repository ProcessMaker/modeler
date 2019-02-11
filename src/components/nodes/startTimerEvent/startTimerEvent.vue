<template>
  <div>
  </div>
</template>

<script>
import StartEventComponent from '@/components/nodes/startEvent/startEvent';
import clockIcon from '@/assets/clock.svg';

export default {
  extends: StartEventComponent,
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);
  },
};
</script>
