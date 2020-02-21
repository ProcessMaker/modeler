import {
  hasPositionAndSizeAttribs,
  shapeBottom,
  shapeCenterX,
  shapeCenterY,
  shapeLeft,
  shapeRight,
  shapeTop,
} from '@/components/nodes/utilities/shapeMetrics';
import { shapeTypes } from '../../../../tests/e2e/support/constants';

const PROGRAMMATICALLY_IMMOVABLE_SHAPES = [
  shapeTypes.boundaryEvent,
  shapeTypes.poolLane,
];

/**
 * Shapes we can safely call translate() on.
 */
export const canMoveProgrammatically = (shape) => !PROGRAMMATICALLY_IMMOVABLE_SHAPES.includes(shape.get('type'));

/**
 * Things like flow lines can still be moved programmatically (e.g. with
 * arrow keys) - but should not be programmatically aligned.
 */
export function canAlign(shape) {
  return hasPositionAndSizeAttribs(shape) && canMoveProgrammatically(shape);
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

