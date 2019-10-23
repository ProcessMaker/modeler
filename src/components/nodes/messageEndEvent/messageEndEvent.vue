<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import portsConfig from '@/mixins/portsConfig';
import EventShape from '@/components/nodes/intermediateEvent/shape';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import messageEndEventSymbol from '@/assets/message-end-event.svg';
import pull from 'lodash/pull';

export default {
  props: ['graph', 'node', 'rootElements', 'id'],
  mixins: [crownConfig, portsConfig, hideLabelOnDrag],
  data() {
    return {
      shape: null,
      message: this.moddle.create('bpmn:Message', {
        id: `${ this.id }_message`,
        name: `${ this.id }_message`,
      }),
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    this.shape = new EventShape();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr('image/xlink:href', messageEndEventSymbol);
    this.shape.attr({
      body: {
        fill: '#FFF1F2',
        stroke: '#ED4757',
      },
      body2: {
        fill: 'none',
      },
      label: {
        text: this.node.definition.get('name'),
        refY: '130%',
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
    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
  destroyed() {
    pull(this.rootElements, this.message);
  },
};
</script>
