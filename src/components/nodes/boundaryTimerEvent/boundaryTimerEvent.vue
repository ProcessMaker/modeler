<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventSymbol from '@/assets/boundary-timer-event-icon.svg';
import boundaryEventSwitcher from '@/mixins/boundaryEventSwitcher';

export default {
  extends: BoundaryEvent,
  mixins: [boundaryEventSwitcher],
  mounted() {
    this.shape.attr('image/xlink:href', timerEventSymbol);
    let bounds = this.node.diagram.bounds;
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      image: {
        'ref-x': 8,
        'ref-y': 8,
        'width': bounds.get('width') - 16,
        'height': bounds.get('height') - 16,
      },
    });

    const task = this.getTaskUnderShape();

    if (task) {
      task.embed(this.shape);
    } else {
      this.$emit('remove-node', this.node);
    }
  },
};
</script>
