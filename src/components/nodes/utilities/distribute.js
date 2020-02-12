import { moveShapeLeftTo, moveShapeMiddleXTo, moveShapeMiddleYTo } from '@/components/nodes/utilities/shapeMovement';
import { getBoundingBox } from '@/components/nodes/utilities/shapeGroup';

export function distributeVerticalCentersEvenly(shapes) {
  const bounds = getBoundingBox(shapes);
  const itemCount = shapes.length;
  if (itemCount < 3) {
    return;
  }

  const topToBottom = shapes.sort((a, b) => a.position().y - b.position().y);
  const topShape = topToBottom[0];
  const bottomShape = topToBottom[itemCount - 1];

  const availableHeight = bounds.height
    - (topShape.size().height / 2)
    - (bottomShape.size().height / 2);

  const distanceBetweenCenters = availableHeight / (itemCount - 1);
  const offset = bounds.top + (topShape.size().height / 2);
  topToBottom.forEach((shape, idx) => {
    if (idx === 0) {
      return;
    }

    moveShapeMiddleYTo(shape, offset + idx * distanceBetweenCenters);
  });
}

export function distributeHorizontalCentersEvenly(shapes) {
  const bounds = getBoundingBox(shapes);
  const itemCount = shapes.length;
  if (itemCount < 3) {
    return;
  }

  const leftToRight = shapes.sort((a, b) => a.position().x - b.position().x);
  const leftmostShape = leftToRight[0];
  const rightmostShape = leftToRight[itemCount - 1];

  const availableWidth = bounds.width
    - (leftmostShape.size().width / 2)
    - (rightmostShape.size().width / 2);

  const distanceBetweenCenters = availableWidth / (itemCount - 1);
  const offset = bounds.left + (leftmostShape.size().width / 2);

  leftToRight.forEach((shape, idx) => {
    if (idx === 0) {
      return;
    }

    moveShapeMiddleXTo(shape, offset + idx * distanceBetweenCenters);
  });
}

export function distributeHorizontalSpacingEvenly(shapes) {
  const bounds = getBoundingBox(shapes);
  const itemCount = shapes.length;
  const minimumArrangeable = 3; // less than 3 is evenly spaced by definition
  if (itemCount < minimumArrangeable) {
    return;
  }
  const totalShapeWidth = shapes.reduce((sum, shape) => shape.size().width + sum, 0);
  const leftToRight = shapes.sort((a, b) => a.position().x - b.position().x);
  let offset = bounds.left + shapes[0].size().width;
  const spaceBetween = (bounds.width - totalShapeWidth) / (leftToRight.length - 1);
  leftToRight.forEach((shape, idx) => {
    if (idx === 0) {
      return;
    }
    moveShapeLeftTo(shape, offset + spaceBetween);
    offset += spaceBetween + shape.size().width;
  });
}
