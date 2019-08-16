<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventIcon from '@/assets/timer-event-icon.svg';
import boundaryEventSwitcher from '@/mixins/boundaryEventSwitcher';
import { portGroups } from '@/mixins/portsConfig';
import portsConfig from '@/mixins/portsConfig';
import crownConfig from '@/mixins/crownConfig';
import joint from 'jointjs';

function getPointFromGroup(model, group) {
  const { x: shapeX, y: shapeY } = model.position();
  const { x, y } = Object.values(model.getPortsPositions(group))[0];

  return new joint.g.Point(shapeX + x, shapeY + y);
}

function getPortPoints(model) {
  return portGroups.filter(group => group !== 'absolute').map(group => getPointFromGroup(model, group));
}

function closestPort(model, anchorReference) {
  return getPortPoints(model).sort((p1, p2) => {
    const referencePoint = new joint.g.Point(anchorReference.x, anchorReference.y);
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

    return new joint.g.Point(x - (width / 2), y - (height / 2));
  }

  return closestPort(model, coords);
}

export default {
  extends: BoundaryEvent,
  mixins: [boundaryEventSwitcher, portsConfig, crownConfig],
  watch: {
    'node.definition.cancelActivity'(value) {
      this.renderBoundaryTimer(value);
    },
  },
  methods: {
    updateBoundaryShape(dashLength) {
      this.shape.attr({
        body: {
          'strokeDasharray': dashLength,
        },
        body2: {
          'strokeDasharray': dashLength,
        },
      });
    },
    renderBoundaryTimer(isCancelActivity) {
      const dashedLine = 5;
      const solidLine = 0;
      isCancelActivity ? this.updateBoundaryShape(solidLine) : this.updateBoundaryShape(dashedLine);
    },
    updateSnappingPosition(task) {
      const { x, y } = snapToAnchor(this.shape.position(), task);
      const { width } = this.shape.size();
      this.shape.position(x - (width / 2), y - (width / 2));
    },
  },
  async mounted() {
    this.shape.attr('image/xlink:href', timerEventIcon);
    let bounds = this.node.diagram.bounds;
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      image: {
        'ref-x': 5,
        'ref-y': 5,
        'width': bounds.get('width') - 10,
        'height': bounds.get('height') - 10,
      },
    });

    await this.$nextTick();

    const task = this.getTaskUnderShape();

    if (task) {
      task.embed(this.shape);
      this.updateSnappingPosition(task);
      this.renderBoundaryTimer(this.node.definition.cancelActivity);

      this.shape.listenTo(this.paper, 'element:pointerup', cellView => {
        if (cellView.model !== this.shape) {
          return;
        }

        this.updateSnappingPosition(task);
        this.updateCrownPosition();
      });
    } else {
      this.$emit('remove-node', this.node);
    }
  },
};
</script>
