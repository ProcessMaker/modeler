<template>
  <div/>
</template>

<script>
import { shapes, util } from 'jointjs';
import connectIcon from '@/assets/connect-artifacts.svg';
import crownConfig from '@/mixins/crownConfig';

export const maxTextAnnotationWidth = 160;
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
    setElementHeight(previousHeight, currentBoundsHeight, labelText) {
      const labelPadding = 15;
      let newHeight = previousHeight;
      const shapeView = this.shape.findView(this.paper);
      const newLabelHeight = shapeView.selectors.label.getBBox().height + labelPadding;
      if (newLabelHeight !== previousHeight) {
        newHeight = newLabelHeight;
      }
      if (labelText.length === 0) {
        newHeight = currentBoundsHeight;
      }

      this.shape.resize(this.nodeWidth, newHeight);
    },
    updateNodeText(text) {
      let { height } = this.shape.findView(this.paper).getBBox();
      const refPoints = `25 ${height} 3 ${height} 3 3 25 3`;
      const bounds = this.node.diagram.bounds;
      this.shape.position(bounds.x, bounds.y);
      this.shape.attr({
        body: { refPoints },
        label: {
          text: util.breakText(text, {
            width: maxTextAnnotationWidth,
          }),
          fill: 'black',
          textAnchor: 'left',
        },
      });
      this.paper.once('render:done', () => {
        this.setElementHeight(height, bounds.height, text);
        this.updateCrownPosition();
      });
    },
  },
  mounted() {
    const bounds = this.node.diagram.bounds;

    this.shape = new shapes.standard.Polyline();
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
