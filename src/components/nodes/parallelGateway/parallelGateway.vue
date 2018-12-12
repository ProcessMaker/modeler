<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';

joint.dia.Element.define(
  'processmaker.modeler.bpmn.parallelGateway',
  {
    size: {
      width: 80,
      height: 80,
    },
    attrs: {
      '.body': {
        strokeWidth: 2,
        stroke: '#000000',
        points: '40,0, 80,40, 40,80, 0,40',
        fill: '#FFFFFF',
      },
      '.label': {
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refX: '50%',
        refY: '130%',
        fontSize: 14,
        fill: '#333333',
      },
      '.iconSideA': {
        strokeWidth: '10',
        points: '40 220 80 180 120 220',
        stroke: 'black',
        fill: 'transparent',
        transform: 'translate(35.5, -15.5) rotate(45) scale(0.20)',
      },
      '.iconSideB': {
        strokeWidth: '10',
        points: '40 220 80 180 120 220',
        stroke: 'black',
        fill: 'transparent',
        transform: 'translate(7.25, 58) rotate(-135) scale(0.20)',
      },
      image: {
        width: 40,
        height: 40,
        'xlink:href': '',
        transform: 'translate(20,20)',
      },
    },
  },
  {
    markup:
      '<g class="rotatable"><g class="scalable"><polygon class="body"/><image/></g></g><text class="label"/><polyline class="iconSideA"/><polyline class="iconSideB"/>',
  }
);

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      crownConfig: [
        {
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  watch: {
    'node.definition.name'(name) {
      const { width } = this.shapeView.getBBox();
      this.shape.attr('.label/text', joint.util.breakText(name, { width }));
    },
  },
  mounted() {
    this.shape = new joint.shapes.processmaker.modeler.bpmn.parallelGateway();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      '.label': {
        text: this.node.definition.get('name'),
        fill: 'black',
      },
    });
    this.shape.on('change:position', (element, position) => {
      this.node.diagram.bounds.x = position.x;
      this.node.diagram.bounds.y = position.y;
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;

    this.shape.on('change:position', (element, position) => {
      this.node.diagram.bounds.x = position.x;
      this.node.diagram.bounds.y = position.y;
      // This is done so any flows pointing to this task are updated
      this.$emit(
        'move',
        {
          x: bounds.x,
          y: bounds.y,
        },
        element
      );
    });
  },
};
</script>
