<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventIcon from '@/assets/timer-event-icon.svg';
import boundaryEventSwitcher from '@/mixins/boundaryEventSwitcher';
import { portGroups } from '@/mixins/portsConfig';
import joint from 'jointjs';

function getPointFromGroup(view, group) {
  const { x: shapeX, y: shapeY } = view.position();
  const { x, y } = Object.values(view.getPortsPositions(group))[0];

  return new joint.g.Point(shapeX + x, shapeY + y);
}

function getPortPoints(view) {
  return portGroups.map(group => getPointFromGroup(view, group));
}

function closestPort(endView, anchorReference) {
  return getPortPoints(endView).sort((p1, p2) => {
    const referencePoint = new joint.g.Point(anchorReference.x, anchorReference.y);
    return referencePoint.distance(p1) - referencePoint.distance(p2);
  })[0];
}
export default {
  extends: BoundaryEvent,
  mixins: [boundaryEventSwitcher],
  mounted() {
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

    const task = this.getTaskUnderShape();

    if (task) {
      task.embed(this.shape);
      const { x, y } = closestPort(task, this.shape.position());
      const { width } = this.shape.size();
      this.shape.position(x - (width / 2), y - (width / 2));
    } else {
      this.$emit('remove-node', this.node);
    }
  },
};
</script>
