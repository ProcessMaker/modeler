<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import errorBoltIcon from '@/assets/boundary-error-event-icon.svg';

export default {
  extends: BoundaryEvent,
  mounted() {
    this.shape.attr('image/xlink:href', errorBoltIcon);
  },
};
</script>
