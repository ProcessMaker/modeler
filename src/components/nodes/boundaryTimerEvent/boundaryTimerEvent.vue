<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventIcon from '@/assets/timer-event-icon.svg';
import crownConfig from '@/mixins/crownConfig';

export default {
  extends: BoundaryEvent,
  mixins: [crownConfig],
  methods: {
    updateBoundaryShape(dashLength) {
      this.shape.attr({
        body: {
          'strokeDasharray': dashLength,
        },
        body2: {
          'strokeDasharray': dashLength,
        },
      });
    },
    renderBoundaryTimer(isCancelActivity) {
      const dashedLine = 5;
      const solidLine = 0;
      isCancelActivity ? this.updateBoundaryShape(solidLine) : this.updateBoundaryShape(dashedLine);
    },
  },
  async mounted() {
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
  },
};
</script>
