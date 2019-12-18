import store from '@/store';
import PaperManager from '@/components/paperManager';

const movementKeys = {
  up: ['Up', 'ArrowUp'],
  down: ['Down', 'ArrowDown'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
};

export default function setUpArrowKeyEventHandlers() {
  document.addEventListener('keydown', event => {
    const highlightedShape = store.getters.nodeShape(store.getters.highlightedNode);
    if (!highlightedShape) {
      return;
    }

    if (!isArrowKeyPressed(event.key)) {
      return;
    }

    const [tx, ty] = getPositionToMoveBy(event.key);
    highlightedShape.translate(tx, ty);
  });
}

function getPositionToMoveBy(key) {
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
