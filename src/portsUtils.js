import { g } from 'jointjs';
import { boundaryGroup, defaultGroup } from '@/mixins/portsConfig';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';

function getModelPortPoints(model, group) {
  const { x: modelX, y: modelY } = model.position();
  const points = Object.values(model.getPortsPositions(group))
    .map(({ x, y }) => new g.Point(modelX + x, modelY + y));
  if (!points) {
    const { x, y } = model.position();
    const { width, height } = model.size();
    points.push(new g.Point(x - (width / 2), y - (height / 2)));
  }
  return points;
}

function getClosestAnchorPoint(model, coords, group) {
  const referencePoint = new g.Point(coords.x, coords.y);
  return referencePoint.chooseClosest(getModelPortPoints(model, group));
}

export function getBoundaryAnchorPoint(coords, model) {
  return getClosestAnchorPoint(model, coords, boundaryGroup);
}

export function getDefaultAnchorPoint(coords, endView) {
  return getClosestAnchorPoint(endView.model, coords, defaultGroup);
}

function getShapeCenterPosition(shape) {
  const { x, y } = shape.position();
  const { width, height } = shape.size();

  return {
    x: x + (width / 2),
    y: y + (height / 2),
  };
}

export function getEmptyBoundaryEventPositionsForShape(model) {
  const allPortPoints = getModelPortPoints(model, boundaryGroup);
  const boundaryEventPositions = model
    .getEmbeddedCells()
    .filter(shape => shape.component && shape.component.node.definition.$type === 'bpmn:BoundaryEvent')
    .map(getShapeCenterPosition);

  return differenceWith(allPortPoints, boundaryEventPositions, isEqual);
}
