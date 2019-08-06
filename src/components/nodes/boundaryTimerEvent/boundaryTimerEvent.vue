<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventIcon from '@/assets/timer-event-icon.svg';
import boundaryEventSwitcher from '@/mixins/boundaryEventSwitcher';
import { portGroups } from '@/mixins/portsConfig';
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

      this.shape.set('elementMove', false);
    } else {
      this.$emit('remove-node', this.node);
    }
  },
};
</script>
