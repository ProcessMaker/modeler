import {
  hasPositionAndSizeAttribs,
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
  distributeVerticalSpacingEvenly,
} from '@/components/nodes/utilities/distribute';
import { canAlign } from '@/components/nodes/utilities/shapeMovement';

/**
 * Utility functions that operate on a collection of shapes
 */

export function getBoundingBox(shapes) {

  if (!shapes || !shapes.length || shapes.length === 0) {
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, vMiddle: 0, hMiddle: 0 };
  }

  const left = (shape) => hasPositionAndSizeAttribs(shape) ? shape.position().x : 0;
  const right = (shape) => hasPositionAndSizeAttribs(shape) ? shape.position().x + shape.size().width : 0;
  const top = (shape) => hasPositionAndSizeAttribs(shape) ? shape.position().y : 0;
  const bottom = (shape) => hasPositionAndSizeAttribs(shape) ? shape.position().y + shape.size().height : 0;

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

/**
 * Gets the available options for a group of shapes
 */
export function getShapesOptions(shapes) {
  const alignableShapes = shapes.filter(shape => canAlign(shape));
  const bounds = getBoundingBox(shapes);
  const enoughShapes = alignableShapes.length > 1;
  return {
    can: {
      align: {
        left: enoughShapes && alignableShapes.some(shape => shapeLeft(shape) !== bounds.left),
        horizontalCenter: enoughShapes && alignableShapes.some(shape => shapeCenterX(shape) !== bounds.hMiddle),
        right: enoughShapes && alignableShapes.some(shape => shapeRight(shape) !== bounds.right),
        bottom: enoughShapes && alignableShapes.some(shape => shapeBottom(shape) !== bounds.bottom),
        verticalCenter: enoughShapes && alignableShapes.some(shape => shapeCenterY(shape) !== bounds.vMiddle),
        top: enoughShapes && alignableShapes.some(shape => shapeTop(shape) !== bounds.top),
      },
      distribute: {
        horizontally: enoughShapes && alignableShapes.length > 2,
        vertically: enoughShapes && alignableShapes.length > 2,
      },
    },
    align: {
      left: () => alignLeft(alignableShapes),
      horizontalCenter: () => centerHorizontally(alignableShapes),
      right: () => alignRight(alignableShapes),
      bottom: () => alignBottom(alignableShapes),
      verticalCenter: () => centerVertically(alignableShapes),
      top: () => alignTop(alignableShapes),
    },
    distribute: {
      horizontally: () => distributeHorizontalSpacingEvenly(alignableShapes),
      vertically: () => distributeVerticalSpacingEvenly(alignableShapes),
    },
  };
}
