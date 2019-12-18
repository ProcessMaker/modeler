import PaperManager from '@/components/paperManager';

export const moveAmount = PaperManager.gridSize / 2;

const translationAmount = new Map();
translationAmount.set('Up', [0, -moveAmount]);
translationAmount.set('Down', [0, moveAmount]);
translationAmount.set('Left', [-moveAmount, 0]);
translationAmount.set('Right', [moveAmount, 0]);

export default function moveShapeByKeypress(key, shape) {
  const match = key.match(/^(?:Arrow)?(Up|Down|Left|Right)$/);
  const keyCode = match && match.length ? match[1] : undefined;
  if (!shape || !translationAmount.has(keyCode)) {
    return;
  }

  const [tx, ty] = translationAmount.get(keyCode);
  shape.translate(tx, ty);
}
