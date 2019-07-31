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
    const isShapeEmbedded = this.node.boundaryEventTarget.embed(this.shape);
    this.shape.attr('image/xlink:href', clockIcon);

    if (isShapeEmbedded) {
      this.shape.remove();
      this.$emit('add-boundary-event', this.shape);
    }
  },
};
</script>
