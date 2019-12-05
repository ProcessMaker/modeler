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
import { util } from 'jointjs';
import portsConfig from '@/mixins/portsConfig';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from '@/components/nodes/task/taskConfig';
import store from '@/store';
import uniqBy from 'lodash/uniqBy';
import hasMarkers, { markerSize } from '@/mixins/hasMarkers';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import { elementIdParser } from '@/components/nodes/subProcess/elementIdParser';
import CrownConfig from '@/components/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';

const labelPadding = 15;
const topAndBottomMarkersSpace = 2 * markerSize;

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
  mixins: [highlightConfig, portsConfig, hasMarkers, hideLabelOnDrag],
  watch: {
    'node.definition.name'(name) {
      const { width } = this.node.diagram.bounds;
      this.shape.attr('label/text', util.breakText(name, { width }));

      /* Update shape height if label text overflows */
      const labelHeight = this.shapeView.selectors.label.getBBox().height;
      const { height } = this.shape.size();

      if (labelHeight + labelPadding + topAndBottomMarkersSpace !== height) {
        const newHeight = Math.max(labelHeight + labelPadding + topAndBottomMarkersSpace, taskHeight);
        this.node.diagram.bounds.height = newHeight;
        this.shape.resize(width, newHeight);
        this.recalcMarkersAlignment();
      }
    },
    'node.definition.calledElement'(calledElement) {
      if (!calledElement) {
        return;
      }

      const { ownerProcessId, processId } = elementIdParser(calledElement);

      const calledSubProcess = store.getters.globalProcesses
        .find(process => process.id == processId);

      let calledElementName = calledSubProcess.name;
      if (uniqBy(calledSubProcess.events, 'ownerProcessName').length > 1) {
        const calledSubProcess = calledSubProcess.events.find(event => event.ownerProcessId == ownerProcessId);
        calledElementName += ` (${calledSubProcess.ownerProcessName})`;
      }

      store.commit('updateNodeProp', {
        node: this.node,
        key: 'name',
        value: calledElementName,
      });
      this.$emit('save-state');
    },
    'node.definition.callActivityType'(callActivityType) {
      this.shape.attr('image/display', callActivityType === 'globalTask' ? 'none' : 'initial');
    },
  },
  mounted() {
    this.shape = new TaskShape();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      body: {
        rx: 8,
        ry: 8,
        strokeWidth: 4,
      },
      label: {
        text: util.breakText(this.node.definition.get('name'), { width: bounds.width }),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
