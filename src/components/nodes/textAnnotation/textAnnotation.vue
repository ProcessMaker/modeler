<template>
  <div/>
</template>

<script>
import joint from 'jointjs';
import connectIcon from '@/assets/connect-artifacts.svg';
import crownConfig from '@/mixins/crownConfig';
import { highlightPadding } from '@/mixins/crownConfig';

export const maxTextAnnotationWidth = 160;
export const textAnnotationLabelPadding = 15;

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      nodeWidth: 10,
      crownConfig: [
        {
          id: 'association-flow-button',
          title: this.$t('Association Flow'),
          icon: connectIcon,
          clickHandler: this.addAssociation,
        },
      ],
    };
  },
  watch: {
    'node.definition.text'(text) {
      this.updateNodeText(text);
    },
  },
  methods: {
    updateNodeText(text) {
      let { height } = this.shape.findView(this.paper).getBBox();
      const refPoints = `25 ${height} 3 ${height} 3 3 25 3`;
      const bounds = this.node.diagram.bounds;
      const textAnnotationLength = text.length;

      this.shape.position(bounds.x, bounds.y);
      this.shape.attr({
        body: { refPoints },
        label: {
          text: joint.util.breakText(text, {
            width: maxTextAnnotationWidth,
          }),
          fill: 'black',
          textAnchor: 'left',
        },
      });

      const shapeView = this.shape.findView(this.paper);
      const labelHeight = shapeView.selectors.label.getBBox().height;
      if (labelHeight + textAnnotationLabelPadding !== height) {
        height = labelHeight + textAnnotationLabelPadding;
        this.shape.resize(this.nodeWidth, height - highlightPadding);
      }

      if (textAnnotationLength === 0) {
        this.shape.resize(this.nodeWidth, bounds.height);
      }

      this.updateCrownPosition();
    },
  },
  mounted() {
    const bounds = this.node.diagram.bounds;

    this.shape = new joint.shapes.standard.Polyline();
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(this.nodeWidth, bounds.height);
    this.shape.attr({
      body: {
        refPoints: '25 10 3 10 3 3 25 3',
      },
      label: {
        fill: 'black',
        yAlignment: 'left',
        xAlignment: 'left',
        refX: '5',
        refY: '5',
      },
    });

    this.shape.on('change:size', () => {
      this.updateCrownPosition();
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.updateNodeText(this.node.definition.get('text'));
  },
};
</script>
