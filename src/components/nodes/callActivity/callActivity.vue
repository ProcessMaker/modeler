<template>
  <div/>
</template>

<script>
import joint from 'jointjs';
import connectIcon from '@/assets/connect-elements.svg';
import crownConfig from '@/mixins/crownConfig';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from '@/components/nodes/task';
import store from '@/store';
import uniqBy from 'lodash/uniqBy';

const labelPadding = 15;

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      crownConfig: [
        {
          id: 'sequence-flow-button',
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  watch: {
    'node.definition.name'(name) {
      const { width } = this.node.diagram.bounds;
      this.shape.attr('label/text', joint.util.breakText(name, { width }));

      /* Update shape height if label text overflows */
      const labelHeight = this.shapeView.selectors.label.getBBox().height;
      const { height } = this.shape.size();

      if (labelHeight + labelPadding !== height) {
        const newHeight = Math.max(labelHeight + 15, taskHeight);
        this.node.diagram.bounds.height = newHeight;
        this.shape.resize(width, newHeight);
      }
    },
    'node.definition.calledElement'(calledElement) {
      const [ownerProcessId, processId] = calledElement.split('-');

      const calledProcess = store.getters.globalProcesses
        .find(process => process.id == processId);

      let calledElementName = calledProcess.name;
      if (uniqBy(calledProcess.events, 'ownerProcessName').length > 1) {
        const calledSubProcess = calledProcess.events.find(event => event.ownerProcessId == ownerProcessId);
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
    const defaultName = this.node.definition.get('name');

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
        text: joint.util.breakText(this.$t(defaultName), { width: bounds.width }),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
