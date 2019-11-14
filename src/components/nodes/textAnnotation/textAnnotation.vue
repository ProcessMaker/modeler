<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :nodeRegistry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    @remove-node="$emit('remove-node', $event)"
    @add-node="$emit('add-node', $event)"
    @save-state="$emit('save-state', $event)"
  />
</template>

<script>
import { shapes, util } from 'jointjs';
import connectIcon from '@/assets/connect-artifacts.svg';
import portsConfig from '@/mixins/portsConfig';
import { highlightPadding } from '@/mixins/crownConfig';
import CrownConfig from '@/components/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';

export const maxTextAnnotationWidth = 160;
export default {
  components: {
    CrownConfig,
  },
  props: [
    'graph',
    'node',
    'id',
    'highlighted',
    'nodeRegistry',
    'moddle',
    'paper',
    'collaboration',
    'processNode',
    'planeElements',
    'isRendering',
  ],
  mixins: [highlightConfig, portsConfig],
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

      this.shape.resize(this.nodeWidth, newHeight - highlightPadding);
    },
    updateNodeText(text) {
      const { height } = this.shape.findView(this.paper).getBBox();
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

    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.updateNodeText(this.node.definition.get('text'));
  },
};
</script>
