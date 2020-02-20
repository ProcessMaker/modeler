import { moveShapeLeftTo, moveShapeMiddleYTo, moveShapeTopTo } from '@/components/nodes/utilities/shapeMovement';
import { getBoundingBox } from '@/components/nodes/utilities/shapeGroup';
import { shapeCenterX, shapeCenterY } from '@/components/nodes/utilities/shapeMetrics';

export function distributeVerticalCentersEvenly(shapes) {
  const bounds = getBoundingBox(shapes);
  const itemCount = shapes.length;
  if (itemCount < 3) {
    return;
  }

  const topToBottom = shapes.sort((a, b) => shapeCenterY(a) - shapeCenterY(b));
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

export function distributeVerticalSpacingEvenly(shapes) {
  const bounds = getBoundingBox(shapes);
  const itemCount = shapes.length;
  const minimumArrangeable = 3; // less than 3 is evenly spaced by definition
  if (itemCount < minimumArrangeable) {
    return;
  }
  const totalShapeHeight = shapes.reduce((sum, shape) => shape.size().height + sum, 0);
  const topToBottom = shapes.sort((a, b) => shapeCenterY(a) - shapeCenterY(b));
  let offset = bounds.top + shapes[0].size().height;
  const spaceBetween = (bounds.height - totalShapeHeight) / (topToBottom.length - 1);
  topToBottom.forEach((shape, idx) => {
    if (idx === 0) {
      return;
    }
    moveShapeTopTo(shape, offset + spaceBetween);
    offset += spaceBetween + shape.size().height;
  });
}

export function distributeHorizontalSpacingEvenly(shapes) {
  const bounds = getBoundingBox(shapes);
  const itemCount = shapes.length;
  const minimumArrangeable = 3;
  if (itemCount < minimumArrangeable) {
    return;
  }
  const totalShapeWidth = shapes.reduce((sum, shape) => shape.size().width + sum, 0);
  const leftToRight = shapes.sort((a, b) => shapeCenterX(a) - shapeCenterX(b));
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
