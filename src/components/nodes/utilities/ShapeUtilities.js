// function isProgrammaticallyMovable(shape) {
//   const programaticallyImmovable = [
//     'processmaker.modeler.bpmn.pool',
//     'PoolLane',
//     'processmaker.components.nodes.boundaryEvent.Shape',
//   ];
//   return shape || !programaticallyImmovable.includes(shape.get('type'));
// }

function getShapeMiddleX(shape) {
  return shape.position().x + (shape.size().width / 2);
}

function getShapeMiddleY(shape) {
  return shape.position().y + (shape.size().height / 2);
}

function moveShapeBottomTo(shape, Y) {
  const dy = Y - (shape.position().y + shape.size().height);
  shape.translate(0, dy);
}

function moveShapeLeftTo(shape, X) {
  const dx = X - shape.position().x;
  shape.translate(dx, 0);
}

function moveShapeRightTo(shape, X) {
  const dx = X - (shape.position().x + shape.size().width);
  shape.translate(dx, 0);
}

function moveShapeMiddleXTo(shape, X) {
  const dx = X - getShapeMiddleX(shape);
  shape.translate(dx, 0);
}

function moveShapeMiddleYTo(shape, Y) {
  const dy = Y - getShapeMiddleY(shape);
  shape.translate(0, dy);
}

function moveShapeTopTo(shape, Y) {
  const dy = Y - shape.position().y;
  shape.translate(0, dy);
}

module.exports = {
  getShapeMiddleX,
  getShapeMiddleY,
  moveShapeBottomTo,
  moveShapeLeftTo,
  moveShapeMiddleXTo,
  moveShapeMiddleYTo,
  moveShapeRightTo,
  moveShapeTopTo,
};
