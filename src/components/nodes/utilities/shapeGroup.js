import {
  shapeBottom,
  shapeCenterX,
  shapeCenterY,
  shapeLeft,
  shapeRight,
  shapeTop,
} from '@/components/nodes/utilities/shapeMetrics';
import {
  alignBottom,
  alignLeft,
  alignRight,
  alignTop,
  centerHorizontally,
  centerVertically,
} from '@/components/nodes/utilities/align';
import {
  distributeHorizontalSpacingEvenly,
  distributeVerticalCentersEvenly,
} from '@/components/nodes/utilities/distribute';

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

export function getShapesOptions(shapes) {
  const bounds = getBoundingBox(shapes);
  const canAlign = shapes.length > 1;
  return {
    can: {
      align: {
        left: canAlign && shapes.some(shape => shapeLeft(shape) !== bounds.left),
        horizontalCenter: canAlign && shapes.some(shape => shapeCenterX(shape) !== bounds.hMiddle),
        right: canAlign && shapes.some(shape => shapeRight(shape) !== bounds.right),
        bottom: canAlign && shapes.some(shape => shapeBottom(shape) !== bounds.bottom),
        verticalCenter: canAlign && shapes.some(shape => shapeCenterY(shape) !== bounds.vMiddle),
        top: canAlign && shapes.some(shape => shapeTop(shape) !== bounds.top),
      },
      distribute: {
        horizontally: canAlign && shapes.length > 2,
        vertically: canAlign && shapes.length > 2,
      },
    },
    align: {
      left: () => alignLeft(shapes),
      horizontalCenter: () => centerHorizontally(shapes),
      right: () => alignRight(shapes),
      bottom: () => alignBottom(shapes),
      verticalCenter: () => centerVertically(shapes),
      top: () => alignTop(shapes),
    },
    distribute: {
      horizontally: () => distributeHorizontalSpacingEvenly(shapes),
      vertically: () => distributeVerticalCentersEvenly(shapes),
    },
  };
}
