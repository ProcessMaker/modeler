import { g } from 'jointjs/dist/joint';
import { boundaryGroup, defaultGroup } from '@/mixins/portsConfig';

function getPortPoints(model, group = defaultGroup) {
  const { x: shapeX, y: shapeY } = model.position();
  const portPositions = Object.values(model.getPortsPositions(group));
  return portPositions.map(({ x, y }) => new g.Point(shapeX + x, shapeY + y));
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
  return getPortPoints(model, group)
    .sort((p1, p2) => {
      const referencePoint = new g.Point(coords.x, coords.y);
      return referencePoint.distance(p1) - referencePoint.distance(p2);
    })[0];
}

export function getBoundaryAnchorCoordinates(coords, model) {
  return getClosestAnchorPoint(model, coords, boundaryGroup);
}

export function getDefaultAnchorCoordinates(coords, endView) {
  return getClosestAnchorPoint(endView.model, coords, defaultGroup);
}
