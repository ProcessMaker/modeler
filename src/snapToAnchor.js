import { g } from 'jointjs/dist/joint';

function getPointsFromGroup(model, group) {
  const { x: shapeX, y: shapeY } = model.position();
  const portPositions = Object.values(model.getPortsPositions(group));
  return portPositions.map(({x, y}) => new g.Point(shapeX + x, shapeY + y));
}

function getPortPoints(model) {
  return getPointsFromGroup(model, 'absolute');
}

export function closestPort(model, anchorReference) {
  return getPortPoints(model).sort((p1, p2) => {
    const referencePoint = new g.Point(anchorReference.x, anchorReference.y);
    return referencePoint.distance(p1) - referencePoint.distance(p2);
  })[0];
}

function hasPorts(model) {
  return Object.values(model.getPortsPositions('absolute')).length > 0;
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
