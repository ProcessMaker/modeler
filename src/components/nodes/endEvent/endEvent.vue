<template>
  <div/>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    // Now, let's add a rounded rect to the graph
    this.shape = new joint.shapes.standard.Circle();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      body: {
        fill: '#FFF1F2',
        stroke: '#ED4757',
      },
      label: {
        text: this.node.definition.get('name'),
        refY: '130%',
      },
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>

<style lang="scss" scoped>
</style>

