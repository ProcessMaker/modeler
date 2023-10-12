import { g } from 'jointjs';
import { boundaryGroup, defaultGroup, rectangleGroup } from '@/mixins/portsConfig';
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

export function getRectangleAnchorPoint(coords, endView) {
  return getClosestAnchorPoint(endView.model, coords, rectangleGroup);
}

export function aPortEveryXPixels(pixels) {
  function getTopPoints(boundingBox) {
    const topMiddle = boundingBox.topMiddle();
    const top = [topMiddle];
    let i = 0;
    let rightPoint = topMiddle.clone();
    while (rightPoint.x < boundingBox.topRight().x) {
      i++;
      rightPoint = topMiddle.clone();
      rightPoint.translate(pixels * i);
      top.push(rightPoint, rightPoint.reflection(topMiddle));
    }
    top.push(boundingBox.topLeft());
    top.push(boundingBox.topRight());
    return top;
  }

  function getLeftPoints(boundingBox) {
    const leftMiddle = boundingBox.leftMiddle();
    const left = [leftMiddle];
    let sidePoint = leftMiddle;
    let i = 0;
    while (sidePoint.y < boundingBox.bottomLeft().y) {
      i++;
      sidePoint = leftMiddle.clone();
      sidePoint.translate(0, pixels * i);
      left.push(sidePoint, sidePoint.reflection(leftMiddle));
    }
    return left;
  }

  return (coords, endView) => {
    const boundingBox = endView.model.getBBox({ useModelGeometry: true });

    const top = getTopPoints(boundingBox);
    const left = getLeftPoints(boundingBox);
    const bottom = top.map(point => point.reflection(boundingBox.center()));
    const right = left.map(point => point.reflection(boundingBox.center()));

    const points = [...top, ...bottom, ...left, ...right, boundingBox.center()];

    const referencePoint = new g.Point(coords.x, coords.y);
    return referencePoint.chooseClosest(points);
  };
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
    .filter(shape => shape.component && shape.component.node.isBpmnType('bpmn:BoundaryEvent'))
    .map(getShapeCenterPosition);

  return differenceWith(allPortPoints, boundaryEventPositions, isEqual);
}
