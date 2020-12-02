import { g } from 'jointjs';
import {boundaryGroup, defaultGroup, rectangleGroup} from '@/mixins/portsConfig';
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

export function nPortsPerSide(portsPerSide) {
  return (coords, endView) => {
    const { x: modelX, y: modelY } = endView.model.position();
    const { width, height } = endView.model.size();
    const xOffset = Math.floor(width / portsPerSide);
    const yOffset = Math.floor(height / portsPerSide);
    const top = [];
    const bottom = [];
    const left = [];
    const right = [];
    for (let i = 0; i < portsPerSide; i++) {
      top.push({x: modelX + (i * xOffset), y: modelY});
      bottom.push({x: modelX + (i * xOffset), y: modelY + height});
      left.push({x:modelX, y:  modelY + (i * yOffset)});
      right.push({x:modelX + width, y:  modelY + (i * yOffset)});
    }
    const center = {x: modelX + width/ 2, y: modelY + height / 2};
    const points = [...top, ...bottom, ...left, ...right, center];
    const referencePoint = new g.Point(coords.x, coords.y);
    return referencePoint.chooseClosest(points);
  };
}

// eslint-disable-next-line no-unused-vars
export function aPortEveryXPixels(pixels) {
  return (coords, endView) => {
    // const { x: modelX, y: modelY } = endView.model.position();
    // eslint-disable-next-line no-unused-vars
    const { width, height } = endView.model.size();

    const bb = endView.model.getBBox({ useModelGeometry: true });

    const topMiddle = bb.topMiddle();
    const top = [topMiddle];

    let i = 0;
    do {
      i++;
      const rightPoint = topMiddle.clone();
      rightPoint.translate(pixels * i);
      if (rightPoint.x >= bb.topRight().x) {
        break;
      }
      top.push(rightPoint);
      top.push(rightPoint.reflection(topMiddle));

      // eslint-disable-next-line no-constant-condition
    } while (i < 100);

    top.push(bb.topLeft());
    top.push(bb.topRight());

    const bottom = top.map(point => {
      return point.reflection(bb.center());
    });

    const points = [...top, ...bottom];

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
