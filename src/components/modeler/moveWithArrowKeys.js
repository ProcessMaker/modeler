import PaperManager from '@/components/paperManager';

export default function moveShapeByKeypress(key, shape) {
  if (!shape || !isArrowKeyPressed(key)) {
    return;
  }

  const [tx, ty] = getAmountToTranslateBy(key);
  shape.translate(tx, ty);
}

const moveAmount = PaperManager.gridSize / 2;

const arrowKeyCodes = new Map();
arrowKeyCodes.set('Up', 'up');
arrowKeyCodes.set('ArrowUp', 'up');
arrowKeyCodes.set('Down', 'down');
arrowKeyCodes.set('ArrowDown', 'down');
arrowKeyCodes.set('Left', 'left');
arrowKeyCodes.set('ArrowLeft', 'left');
arrowKeyCodes.set('Right', 'right');
arrowKeyCodes.set('ArrowRight', 'right');

const translationAmount = new Map();
translationAmount.set('up', [0, -moveAmount]);
translationAmount.set('down', [0, moveAmount]);
translationAmount.set('left', [-moveAmount, 0]);
translationAmount.set('right', [moveAmount, 0]);

function getAmountToTranslateBy(key) {
  const keyCode = arrowKeyCodes.get(key);
  return translationAmount.get(keyCode);
}

function isArrowKeyPressed(key) {
  return arrowKeyCodes.has(key);
}
