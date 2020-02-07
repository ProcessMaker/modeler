import {
  moveShapeBottomTo,
  moveShapeLeftTo,
  moveShapeMiddleXTo,
  moveShapeMiddleYTo,
  moveShapeRightTo,
  moveShapeTopTo,
} from '@/components/nodes/utilities/ShapeUtilities';

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

export function centerX(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeMiddleXTo(shape, bounds.hMiddle);
  });
}

export function centerY(shapes) {
  const bounds = getBoundingBox(shapes);
  shapes.forEach((shape) => {
    moveShapeMiddleYTo(shape, bounds.vMiddle);
  });
}


export function distributeVertically(shapes) {
  const bounds = getBoundingBox(shapes);
  const itemCount = shapes.length;
  if (itemCount < 3) {
    return;
  }

  const topToBottom = shapes.sort((a, b) => a.position().y - b.position().y);
  const topShape = topToBottom[0];
  const bottomShape = topToBottom[itemCount - 1];

  const heightWithoutMiddleOfTopAndBottom = bounds.height
    - (topShape.size().height / 2)
    - (bottomShape.size().height / 2);

  const spacingBetweenMidpoints = heightWithoutMiddleOfTopAndBottom / (itemCount - 1);
  const offset = bounds.top + (topShape.size().height / 2);
  topToBottom.forEach((shape, idx) => {
    if (idx === 0) {
      return;
    }

    moveShapeMiddleYTo(shape, offset + idx * spacingBetweenMidpoints);
  });
}


// TODO: this needs to be associated with the multi-selection box logic. We can
// also pre-emptively recalc this everytime we add / remove items from a
// multiselect
export function getBoundingBox(shapes) {
  const left = (shape) => shape.position().x;
  const right = (shape) => shape.position().x + shape.size().width;
  const top = (shape) => shape.position().y;
  const bottom = (shape) => shape.position().y + shape.size().height;

  const minX = minimum(shapes, left);
  const maxX = maximum(shapes, right);
  const minY = minimum(shapes, top);
  const maxY = maximum(shapes, bottom);
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

function minimum(items, valueFn) {
  return items.reduce((acc, item) => {
    const value = valueFn(item);
    acc = (acc === undefined || value < acc) ? value : acc;
    return acc;
  }, undefined);
}

function maximum(items, valueFn) {
  return items.reduce((acc, item) => {
    const value = valueFn(item);
    acc = (acc === undefined || value > acc) ? value : acc;
    return acc;
  }, undefined);
}
