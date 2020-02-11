import {
  shapeBottom,
  shapeCenterX,
  shapeCenterY,
  shapeLeft,
  shapeRight,
  shapeTop,
} from '@/components/nodes/utilities/shapeMetrics';

function isProgrammaticallyMovable(shape) {
  const programaticallyImmovable = [
    'processmaker.modeler.bpmn.pool',
    'PoolLane',
    'processmaker.components.nodes.boundaryEvent.Shape',
  ];
  return shape || !programaticallyImmovable.includes(shape.get('type'));
}

function moveShapeBottomTo(shape, Y) {
  const dy = Y - shapeBottom(shape);
  shape.translate(0, dy);
}

function moveShapeLeftTo(shape, X) {
  const dx = X - shapeLeft(shape);
  shape.translate(dx, 0);
}

function moveShapeRightTo(shape, X) {
  const dx = X - shapeRight(shape);
  shape.translate(dx, 0);
}

function moveShapeMiddleXTo(shape, X) {
  const dx = X - shapeCenterX(shape);
  shape.translate(dx, 0);
}

function moveShapeMiddleYTo(shape, Y) {
  const dy = Y - shapeCenterY(shape);
  shape.translate(0, dy);
}

function moveShapeTopTo(shape, Y) {
  const dy = Y - shapeTop(shape);
  shape.translate(0, dy);
}

module.exports = {
  isProgrammaticallyMovable,
  moveShapeBottomTo,
  moveShapeLeftTo,
  moveShapeMiddleXTo,
  moveShapeMiddleYTo,
  moveShapeRightTo,
  moveShapeTopTo,
};
