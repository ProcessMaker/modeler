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
  },
};
</script>
