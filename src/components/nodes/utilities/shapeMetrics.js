const shapeBottom = (shape) => shape.position().y + shape.size().height;
const shapeLeft = (shape) => shape.position().x;
const shapeCenterX = (shape) => shape.position().x + (shape.size().width / 2);
const shapeCenterY = (shape) => shape.position().y + (shape.size().height / 2);
const shapeRight = (shape) => shape.position().x + shape.size().width;
const shapeTop = (shape) => shape.position().y;

module.exports = {
  shapeBottom,
  shapeLeft,
  shapeCenterX,
  shapeCenterY,
  shapeRight,
  shapeTop,
};
