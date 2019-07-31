<template>
  <div/>
</template>

<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import clockIcon from '@/assets/intermediate-clock.svg';
import boundaryEventSwitcher from '@/mixins/boundaryEventSwitcher';

export default {
  extends: IntermediateEvent,
  mixins: [boundaryEventSwitcher],
  props: ['graph', 'paper', 'node', 'id', 'moddle', 'nodeRegistry'],
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);
    this.addBoundaryOrTimerEvent();
  },
};
</script>
