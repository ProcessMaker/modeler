import {
  shapeBottom,
  shapeCenterX,
  shapeCenterY,
  shapeLeft,
  shapeRight,
  shapeTop,
} from '@/components/nodes/utilities/shapeMetrics';

export function isProgrammaticallyMovable(shape) {
  const programaticallyImmovable = [
    'processmaker.modeler.bpmn.pool',
    'PoolLane',
    'processmaker.components.nodes.boundaryEvent.Shape',
  ];
  return shape || !programaticallyImmovable.includes(shape.get('type'));
}

export function moveShapeBottomTo(shape, Y) {
  const dy = Y - shapeBottom(shape);
  shape.translate(0, dy);
}

export function moveShapeLeftTo(shape, X) {
  const dx = X - shapeLeft(shape);
  shape.translate(dx, 0);
}

export function moveShapeRightTo(shape, X) {
  const dx = X - shapeRight(shape);
  shape.translate(dx, 0);
}

export function moveShapeMiddleXTo(shape, X) {
  const dx = X - shapeCenterX(shape);
  shape.translate(dx, 0);
}

export function moveShapeMiddleYTo(shape, Y) {
  const dy = Y - shapeCenterY(shape);
  shape.translate(0, dy);
}

export function moveShapeTopTo(shape, Y) {
  const dy = Y - shapeTop(shape);
  shape.translate(0, dy);
}

