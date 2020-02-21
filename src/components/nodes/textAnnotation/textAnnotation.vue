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
import portsConfig from '@/mixins/portsConfig';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';
import focusOnDoubleClick from '@/mixins/focusOnDoubleClick';

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
    'paperManager',
    'collaboration',
    'processNode',
    'planeElements',
    'isRendering',
  ],
  mixins: [highlightConfig, portsConfig, focusOnDoubleClick],
  data() {
    return {
      shape: null,
      definition: null,
      nodeWidth: 10,
    };
  },
  watch: {
    'node.definition.text'(text) {
      this.updateNodeText(text);
    },
  },
  methods: {
    getLabelHeight(labelPadding) {
      return this.shape
        .findView(this.paperManager.paper)
        .selectors
        .label
        .getBBox()
        .height + labelPadding;
    },
    calculateNewHeight(previousHeight, labelText, currentBoundsHeight) {
      const defaultPadding = 3;
      const labelPadding = 15;
      const newLabelHeight = this.getLabelHeight(labelPadding);
      if (newLabelHeight !== previousHeight) {
        return newLabelHeight - defaultPadding;
      }
      if (labelText.length === 0) {
        return currentBoundsHeight - defaultPadding;
      }
      return previousHeight - defaultPadding;
    },
    updateNodeText(text) {
      const { height } = this.shape.findView(this.paperManager.paper).getBBox();
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

      this.paperManager.awaitScheduledUpdates()
        .then(() => {
          this.shape.resize(this.nodeWidth, this.calculateNewHeight(height, text, bounds.height));
          this.setShapeHighlight();
        });
    },
  },
  mounted() {
    const bounds = this.node.diagram.bounds;

    this.shape = new shapes.standard.Polyline();
    this.shape.set('type', 'textAnnotation');
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
