<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import signalEventIcon from '@/assets/boundary-signal-event-icon.svg';

export default {
  extends: BoundaryEvent,
  mounted() {
    this.shape.attr('image/xlink:href', signalEventIcon);
    let bounds = this.node.diagram.bounds;
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      image: {
        'ref-x': 8,
        'ref-y': 7,
        'width': bounds.get('width') - 16,
        'height': bounds.get('height') - 16,
      },
    });
  },
};
</script>
