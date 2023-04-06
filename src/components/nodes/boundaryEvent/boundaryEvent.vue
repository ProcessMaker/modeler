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
    v-on="$listeners"
  />
</template>

<script>
import portsConfig from '@/mixins/portsConfig';
import EventShape from '@/components/nodes/boundaryEvent/shape';
import isValidBoundaryEventTarget from './validBoundaryEventTargets';
import resetShapeColor from '@/components/resetShapeColor';
import { getBoundaryAnchorPoint } from '@/portsUtils';
import { invalidNodeColor } from '@/components/nodeColors';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';
import store from '@/store';
import { canAddBoundaryEventToTarget } from '@/boundaryEventValidation';

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
    'isActive',
  ],
  mixins: [highlightConfig, portsConfig, hideLabelOnDrag],
  data() {
    return {
      shape: null,
      previousPosition: null,
      validPosition: null,
      invalidTargetElement: null,
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
      return this.graph
        .findModelsUnderElement(this.shape)
        .find(model => isValidBoundaryEventTarget(model.component));
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
    toggleInterruptingStyle() {
      this.node.definition.cancelActivity ? this.setSolidShapeBorder() : this.setDashedShapeBorder();
    },
    setShapeProperties() {
      const { x, y, width, height } = this.node.diagram.bounds;
      this.shape.position(x, y);
      this.shape.resize(width, height);
      this.shape.attr('label/text', this.node.definition.get('name'));
      this.shape.component = this;
    },
    hasPositionChanged() {
      if (!this.previousPosition) {
        return true;
      }
      const { x, y } = this.shape.position();
      const { x: prevX, y: prevY } = this.previousPosition;

      return x !== prevX || y !== prevY;
    },
    getCenterPosition() {
      const { x, y } = this.shape.position();
      const { width, height } = this.shape.size();

      return {
        x: x + (width / 2),
        y: y + (height / 2),
      };
    },
    updateShapePosition(task) {
      if (!this.hasPositionChanged()) {
        return;
      }

      const { x, y } = getBoundaryAnchorPoint(this.getCenterPosition(), task);
      const { width, height } = this.shape.size();
      this.shape.position(x - (width / 2), y - (height / 2));

      this.previousPosition = this.shape.position();
    },
    attachBoundaryEventToTask(task) {
      if (!task) {
        return;
      }

      const currentlyAttachedTask = this.shape.getParentCell();

      if (currentlyAttachedTask) {
        currentlyAttachedTask.unembed(this.shape);
      }

      task.embed(this.shape);
      this.node.definition.set('attachedToRef', task.component.node.definition);
    },
    resetToInitialPosition() {
      this.shape.position(this.validPosition.x, this.validPosition.y);
      store.commit('allowSavingElementPosition');
      this.$emit('shape-resize');
    },
    moveBoundaryEventIfOverTask() {
      const task = this.getTaskUnderShape();

      if (!canAddBoundaryEventToTarget(this.node.type, task)) {
        this.resetToInitialPosition();
        return;
      }

      this.attachBoundaryEventToTask(task);
      this.updateShapePosition(task);
      this.$emit('shape-resize');
    },
    resetInvalidTarget() {
      if (this.invalidTargetElement) {
        resetShapeColor(this.invalidTargetElement);
        this.invalidTargetElement = null;
        this.$emit('shape-resize');
      }
    },
    attachToValidTarget(cellView) {
      if (cellView.model !== this.shape) {
        return;
      }

      store.commit('preventSavingElementPosition');
      this.validPosition = this.shape.position();
      this.shape.listenToOnce(this.paper, 'cell:pointerup blank:pointerup', () => {
        this.moveBoundaryEventIfOverTask();
        this.resetInvalidTarget();
        this.$emit('save-state');

        store.commit('allowSavingElementPosition');
      });
    },
    turnInvalidTargetRed() {
      if (!this.isActive) {
        return;
      }

      const targetElement = this.graph
        .findModelsUnderElement(this.shape)
        .filter(model => model.component)[0];

      const targetHasNotChanged = this.invalidTargetElement === targetElement;
      if (targetHasNotChanged) {
        return;
      }

      const currentlyAttachedTask = this.shape.getParentCell();
      if (targetElement && targetElement !== currentlyAttachedTask && !canAddBoundaryEventToTarget(this.node.type, targetElement)) {
        targetElement.attr('body/fill', invalidNodeColor);
      }

      if (this.invalidTargetElement) {
        resetShapeColor(this.invalidTargetElement);
      }

      this.invalidTargetElement = targetElement;
    },
  },
  async mounted() {
    this.shape = new EventShape();
    this.setShapeProperties();
    this.shape.addTo(this.graph);

    await this.$nextTick();

    this.toggleInterruptingStyle();
    const task = this.getTaskUnderShape();
    this.attachBoundaryEventToTask(task);
    this.updateShapePosition(task);

    this.shape.on('change:position', this.turnInvalidTargetRed);
    this.shape.listenTo(this.paper, 'element:pointerdown', this.attachToValidTarget);
  },
};
</script>
