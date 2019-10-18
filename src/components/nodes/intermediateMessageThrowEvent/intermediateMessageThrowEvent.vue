<template>
  <div/>
</template>

<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateMailSymbol from '@/assets/intermediate-mail-alt.svg';
import pull from 'lodash/pull';

export default {
  extends: IntermediateEvent,
  props: ['moddle', 'rootElements', 'id'],
  data() {
    return {
      message: this.moddle.create('bpmn:Message', {
        id: `${ this.id }_message`,
        name: `${ this.id }_message`,
      }),
    };
  },
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
    this.rootElements.push(this.message);
    this.node.definition.get('eventDefinitions')[0].messageRef = this.message;
  },
  destroyed() {
    pull(this.rootElements, this.message);
  },
};
</script>
