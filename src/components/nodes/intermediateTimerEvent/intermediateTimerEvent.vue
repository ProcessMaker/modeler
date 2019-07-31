<template>
  <div/>
</template>

<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import clockIcon from '@/assets/intermediate-clock.svg';

export default {
  extends: IntermediateEvent,
  props: ['graph', 'node', 'id', 'moddle', 'nodeRegistry'],
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);

    if (this.node.boundaryEventTarget) {
      this.$emit('remove-node', this.node);
      this.$emit('add-boundary-event', this.node.boundaryEventTarget, this.node.diagram.bounds);
    }
  },
};
</script>
