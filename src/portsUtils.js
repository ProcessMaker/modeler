import { g } from 'jointjs/dist/joint';
import { boundaryGroup, defaultGroup } from '@/mixins/portsConfig';

function getPortPoints(model, group) {
  const { x: shapeX, y: shapeY } = model.position();
  return Object.values(model.getPortsPositions(group))
    .map(({ x, y }) => new g.Point(shapeX + x, shapeY + y));
}

function hasPorts(model) {
  return Object.values(model.getPortsPositions(defaultGroup)).length > 0;
}

function getClosestAnchorPoint(model, coords, group) {
  if (!hasPorts(model)) {
    const { x, y } = model.position();
    const { width, height } = model.size();
    return new g.Point(x - (width / 2), y - (height / 2));
  }
  const referencePoint = new g.Point(coords.x, coords.y);
  return referencePoint.chooseClosest(getPortPoints(model, group));
}

export function getBoundaryAnchorCoordinates(coords, model) {
  return getClosestAnchorPoint(model, coords, boundaryGroup);
}

export function getDefaultAnchorCoordinates(coords, endView) {
  return getClosestAnchorPoint(endView.model, coords, defaultGroup);
}
