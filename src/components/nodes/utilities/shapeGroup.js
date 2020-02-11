/**
 * Utility functions that operate on a collection of shapes
 */

export function getBoundingBox(shapes) {
  const left = (shape) => shape.position().x;
  const right = (shape) => shape.position().x + shape.size().width;
  const top = (shape) => shape.position().y;
  const bottom = (shape) => shape.position().y + shape.size().height;

  const minX = Math.min(...shapes.map(left));
  const maxX = Math.max(...shapes.map(right));
  const minY = Math.min(...shapes.map(top));
  const maxY = Math.max(...shapes.map(bottom));
  const width = maxX - minX;
  const height = maxY - minY;

  return {
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY,
    width,
    height,
    vMiddle: minY + (height / 2),
    hMiddle: minX + (width / 2),
  };
}
