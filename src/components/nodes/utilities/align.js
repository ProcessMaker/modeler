import { getBoundingBox } from '@/components/nodes/utilities/shapeGroup';
import {
  moveShapeBottomTo,
  moveShapeLeftTo,
  moveShapeMiddleXTo,
  moveShapeMiddleYTo,
  moveShapeRightTo,
  moveShapeTopTo,
} from '@/components/nodes/utilities/shapeMovement';

export function alignLeft(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeLeftTo(shape, bounds.left);
  });
}

export function alignRight(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeRightTo(shape, bounds.right);
  });
}

export function alignTop(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeTopTo(shape, bounds.top);
  });
}

export function alignBottom(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeBottomTo(shape, bounds.bottom);
  });
}

export function centerHorizontally(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeMiddleXTo(shape, bounds.hMiddle);
  });
}

export function centerVertically(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeMiddleYTo(shape, bounds.vMiddle);
  });
}
