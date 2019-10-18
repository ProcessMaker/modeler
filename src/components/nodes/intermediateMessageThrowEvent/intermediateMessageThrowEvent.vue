<template>
  <div/>
</template>

<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateMailSymbol from '@/assets/intermediate-mail-alt.svg';

export default {
  extends: IntermediateEvent,
  mounted() {
    this.shape.attr('image/xlink:href', intermediateMailSymbol);
    this.shape.attr({
      body: {
        stroke: '#000',
        strokeWidth: 1,
        fill: '#fff',
      },
      body2: {
        stroke: '#000',
        strokeWidth: 1,
        fill: '#fff',
      },
      image: {
        width: 22,
        height: 20,
        y: 3,
        x: 2,
      },
    });
  },
};
</script>
