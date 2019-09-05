import { portGroups } from '@/mixins/portsConfig';
import { g } from 'jointjs/dist/joint';

function getPointFromGroup(model, group) {
  const { x: shapeX, y: shapeY } = model.position();
  const { x, y } = Object.values(model.getPortsPositions(group))[0];
  return new g.Point(shapeX + x, shapeY + y);
}

function getPortPoints(model) {
  return portGroups.map(group => getPointFromGroup(model, group));
}

export function closestPort(model, anchorReference) {
  return getPortPoints(model).sort((p1, p2) => {
    const referencePoint = new g.Point(anchorReference.x, anchorReference.y);
    return referencePoint.distance(p1) - referencePoint.distance(p2);
  })[0];
}

function hasPorts(model) {
  return Object.values(model.getPortsPositions(portGroups[0])).length > 0;
}

export function getAnchorCoordinates(coords, model) {
  if (!hasPorts(model)) {
    const { x, y } = model.position();
    const { width, height } = model.size();
    return new g.Point(x - (width / 2), y - (height / 2));
  }
  return closestPort(model, coords);
}

export function snapToAnchor(coords, endView) {
  return getAnchorCoordinates(coords, endView.model);
}
