<template>
  <div />
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import portsConfig from '@/mixins/portsConfig';
import connectIcon from '@/assets/connect-elements.svg';
import EventShape from '@/components/nodes/boundaryEvent/shape';
import validBoundaryEventTargets from './validBoundaryEventTargets';
import { getBoundaryAnchorPoint } from '@/portsUtils';

export default {
  props: ['graph', 'node', 'paper'],
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
      validPosition: null,
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
        .filter(model => model.component)
        .find(model => validBoundaryEventTargets.includes(model.component.node.definition.$type));
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
    updateShapePosition(task) {
      const { x, y } = getBoundaryAnchorPoint(this.shape.position(), task);
      const { width } = this.shape.size();
      this.shape.position(x - (width / 2), y - (width / 2));
      this.updateCrownPosition();
    },
    attachBoundaryEventToTask(task) {
      const currentlyAttachedTask = this.shape.getParentCell();

      if (currentlyAttachedTask) {
        currentlyAttachedTask.unembed(this.shape);
      }

      task.embed(this.shape);
      this.node.definition.set('attachedToRef', task.component.node.definition);
      this.toggleInterruptingStyle(this.node.definition.cancelActivity);
      this.updateShapePosition(task);
    },
    moveBoundaryEventIfOverTask() {
      const task = this.getTaskUnderShape();

      if (!task) {
        this.shape.position(this.validPosition.x, this.validPosition.y);
        this.updateCrownPosition();
        return;
      }

      if (task === this.shape.getParentCell()) {
        this.updateShapePosition(task);
      }

      this.attachBoundaryEventToTask(task);
    },
    listenToShapeMove() {
      this.shape.listenTo(this.paper, 'element:pointerdown', cellView => {
        if (cellView.model !== this.shape) {
          return;
        }

        this.validPosition = this.shape.position();
        this.shape.listenToOnce(this.paper, 'cell:pointerup blank:pointerup', this.moveBoundaryEventIfOverTask);
      });
    },
  },
  async mounted() {
    this.shape = new EventShape();
    this.setShapeProperties();
    this.shape.addTo(this.graph);
    await this.$nextTick();
    this.listenToShapeMove();
    this.toggleInterruptingStyle();

    const task = this.getTaskUnderShape();
    if (task) {
      this.attachBoundaryEventToTask(task);
    }
  },
};
</script>
