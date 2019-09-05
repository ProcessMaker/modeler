<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import portsConfig from '@/mixins/portsConfig';
import connectIcon from '@/assets/connect-elements.svg';
import EventShape from '@/components/nodes/boundaryEvent/shape';
import { id as taskId } from '@/components/nodes/task';
import { id as callActivityId } from '@/components/nodes/callActivity';
import { id as manualTaskId } from '@/components/nodes/manualTask';
import { id as scriptTaskId } from '@/components/nodes/scriptTask';

export default {
  props: ['graph', 'node'],
  mixins: [crownConfig, portsConfig],
  data() {
    return {
      shape: null,
      definition: null,
      crownConfig: [
        {
          id: 'sequence-flow-button',
          title: this.$t('Sequence Flow'),
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
    'node.definition.cancelActivity'(isCancelActivity) {
      this.toggleInterruptingStyle(isCancelActivity);
    },
  },
  methods: {
    getTaskUnderShape() {
      const taskIds = [
        taskId,
        callActivityId,
        manualTaskId,
        scriptTaskId,
      ];

      return this.graph
        .findModelsUnderElement(this.shape)
        .filter(model => model.component)
        .find(model => taskIds.includes(model.component.node.type));
    },
    setShapeBorderDashSpacing(dashLength) {
      this.shape.attr({
        body: {
          strokeDasharray: dashLength,
        },
        body2: {
          strokeDasharray: dashLength,
        },
      });
    },
    setSolidShapeBorder() {
      const solidLineSpacing = 0;
      this.setShapeBorderDashSpacing(solidLineSpacing);
    },
    setDashedShapeBorder() {
      const dashedLineSpacing = 5;
      this.setShapeBorderDashSpacing(dashedLineSpacing);
    },
    toggleInterruptingStyle(isCancelActivity) {
      isCancelActivity ? this.setSolidShapeBorder() : this.setDashedShapeBorder();
    },
    setShapeProperties() {
      const { x, y, width, height } = this.node.diagram.bounds;
      this.shape.position(x, y);
      this.shape.resize(width, height);
      this.shape.attr('label/text', this.node.definition.get('name'));
      this.shape.component = this;
    },
    attachBoundaryEventToTask() {
      const task = this.getTaskUnderShape();

      if (!task) {
        return;
      }

      task.embed(this.shape);
      this.node.definition.set('attachedToRef', task.component.node.definition);
      this.toggleInterruptingStyle(this.node.definition.cancelActivity);
    },
  },
  mounted() {
    this.shape = new EventShape();
    this.setShapeProperties();
    this.shape.addTo(this.graph);
    this.attachBoundaryEventToTask();
  },
};
</script>
