import PaperManager from '@/components/paperManager';

export default function moveShapeByKeypress(key, shape) {
  if (!shape || !isArrowKeyPressed(key)) {
    return;
  }

  const [tx, ty] = getAmountToTranslateBy(key);
  shape.translate(tx, ty);
}

export const movementKeys = {
  up: ['Up', 'ArrowUp'],
  down: ['Down', 'ArrowDown'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
};

function getAmountToTranslateBy(key) {
  const moveAmount = PaperManager.gridSize / 2;

  if (movementKeys.up.includes(key)) {
    return [0, -moveAmount];
  }

  if (movementKeys.down.includes(key)) {
    return [0, moveAmount];
  }

  if (movementKeys.left.includes(key)) {
    return [-moveAmount, 0];
  }

  if (movementKeys.right.includes(key)) {
    return [moveAmount, 0];
  }
}

function isArrowKeyPressed(key) {
  return Object.values(movementKeys).flat().includes(key);
}
