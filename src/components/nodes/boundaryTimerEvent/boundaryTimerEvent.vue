<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventIcon from '@/assets/timer-event-icon.svg';
import boundaryEventSwitcher from '@/mixins/boundaryEventSwitcher';

export default {
  extends: BoundaryEvent,
  mixins: [boundaryEventSwitcher],
  mounted() {
    this.shape.attr('image/xlink:href', timerEventIcon);
    let bounds = this.node.diagram.bounds;
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      image: {
        'ref-x': 5,
        'ref-y': 5,
        'width': bounds.get('width') - 10,
        'height': bounds.get('height') - 10,
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
