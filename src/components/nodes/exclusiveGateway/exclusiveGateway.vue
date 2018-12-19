<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';

joint.dia.Element.define(
  'processmaker.modeler.bpmn.exclusiveGateway',
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
        refY: '50',
        fontSize: 14,
        fill: '#333333',
      },
      '.iconSideA': {
        strokeWidth: '4',
        points: '24 24 55 55',
        stroke: 'black',
        fill: 'transparent',
      },
      '.iconSideB': {
        strokeWidth: '4',
        points: '55 24 24 55',
        stroke: 'black',
        fill: 'transparent',
      },
      image: {
        width: 40,
        height: 40,
        fill: 'transparent',
        'xlink:href': '',
        transform: 'translate(20,20)',
      },
    },
  },
  {
    markup:
      '<g class="rotatable"><g class="scalable"><polygon class="body"/><polyline class="iconSideA"/><polyline class="iconSideB"/><image/></g></g><text class="label"/>',
  }
);

export default {
  props: ['graph', 'node', 'nodes', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      labelWidth: 175,
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
      this.shape.attr('.label/text', name);
    },
  },
  mounted() {
    this.shape = new joint.shapes.processmaker.modeler.bpmn.exclusiveGateway();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      '.label': {
        text: this.node.definition.get('name'),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
