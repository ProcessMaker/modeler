import PaperManager from '@/components/paperManager';

export default function moveShapeByKeypress(key, shape) {
  if (!shape || !isArrowKeyPressed(key)) {
    return;
  }

  const [tx, ty] = getAmountToTranslateBy(key);
  shape.translate(tx, ty);
}

export const moveAmount = PaperManager.gridSize / 2;

const translationAmount = new Map();
translationAmount.set('Up', [0, -moveAmount]);
translationAmount.set('Down', [0, moveAmount]);
translationAmount.set('Left', [-moveAmount, 0]);
translationAmount.set('Right', [moveAmount, 0]);

function normaliseArrowKeyCode(key) {
  const match = key.match(/^(?:Arrow)?(Up|Down|Left|Right)$/);
  return match && match.length ? match[1] : undefined;
}

function getAmountToTranslateBy(key) {
  const keyCode = normaliseArrowKeyCode(key);
  return translationAmount.get(keyCode);
}

function isArrowKeyPressed(key) {
  const keyCode = normaliseArrowKeyCode(key);
  return translationAmount.has(keyCode);
}
