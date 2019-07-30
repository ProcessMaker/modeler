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
      this.$emit('add-boundary-event', this.shape);
      this.shape.on('change:position', (element) => {
        const task = this.graph
          .findModelsUnderElement(element)
          .find(({ component }) => {
            return component && component.node.type === 'processmaker-modeler-task';
          });

        if (task) {
          this.node.boundaryEventTarget.embed(element);
        }

        if (!task) {
          this.shape.attr({
            body: {
              stroke: 'black',
              fill: 'hotpink',
            },
            body2: {
              stroke: 'black',
              fill: 'hotpink',
            },
          });
          this.node.boundaryEventTarget.unembed(element);
        }
      });
    }
  },
};
</script>
