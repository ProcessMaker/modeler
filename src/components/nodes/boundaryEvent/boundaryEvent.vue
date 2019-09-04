<template>
  <div/>
</template>

<script>
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';
import EventShape from '@/components/nodes/boundaryEvent/shape';
import { id as taskId } from '@/components/nodes/task';
import { id as callActivityId } from '@/components/nodes/callActivity';
import { id as manualTaskId } from '@/components/nodes/manualTask';
import { id as scriptTaskId } from '@/components/nodes/scriptTask';
import portsConfig from '@/mixins/portsConfig';
import { portGroups } from '@/mixins/portsConfig';
import { g } from 'jointjs';

function getPointFromGroup(model, group) {
  const { x: shapeX, y: shapeY } = model.position();
  const { x, y } = Object.values(model.getPortsPositions(group))[0];
  return new g.Point(shapeX + x, shapeY + y);
}

function getPortPoints(model) {
  return portGroups.filter(group => group !== 'absolute').map(group => getPointFromGroup(model, group));
}

function closestPort(model, anchorReference) {
  return getPortPoints(model).sort((p1, p2) => {
    const referencePoint = new g.Point(anchorReference.x, anchorReference.y);
    return referencePoint.distance(p1) - referencePoint.distance(p2);
  })[0];
}

function hasPorts(model) {
  return Object.values(model.getPortsPositions(portGroups[0])).length > 0;
}

function snapToAnchor(coords, model) {
  if (!hasPorts(model)) {
    const { x, y } = model.position();
    const { width, height } = model.size();
    return new g.Point(x - (width / 2), y - (height / 2));
  }
  return closestPort(model, coords);
}

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
    updateSnappingPosition(task) {
      const {x, y} = snapToAnchor(this.shape.position(), task);
      const {width} = this.shape.size();
      this.shape.position(x - (width / 2), y - (width / 2));
      this.updateCrownPosition();
    },
    attachBoundaryEventToTask() {
      const task = this.getTaskUnderShape();

      if (!task) {
        return;
      }

      task.embed(this.shape);
      this.node.definition.set('attachedToRef', task.component.node.definition);
      this.toggleInterruptingStyle(this.node.definition.cancelActivity);
      this.updateSnappingPosition(task);

      this.shape.listenTo(this.paper, 'element:pointerup', cellView => {
        if (cellView.model !== this.shape) {
          return;
        }
        this.updateSnappingPosition(task);
      });
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
