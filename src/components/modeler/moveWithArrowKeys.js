import PaperManager from '@/components/paperManager';
import store from '@/store';

export const moveAmount = PaperManager.gridSize / 2;

const translationAmount = new Map();
translationAmount.set('Up', [0, -moveAmount]);
translationAmount.set('Down', [0, moveAmount]);
translationAmount.set('Left', [-moveAmount, 0]);
translationAmount.set('Right', [moveAmount, 0]);

const invalidTypes = [
  'PoolLane',
  'processmaker.components.nodes.boundaryEvent.Shape',
];

export default function moveShapeByKeypress(key, shape, onAfterMove = () => {}) {
  if (!shape || invalidTypes.includes(shape.get('type'))) {
    return;
  }

  const match = key.match(/^(?:Arrow)?(Up|Down|Left|Right)$/);
  const keyCode = match && match[1];

  if (!keyCode) {
    return;
  }

  const [tx, ty] = translationAmount.get(keyCode) || [0, 0];
  shape.translate(tx, ty, { movedWithArrowKeys: true });

  expandPoolToContainElement(shape);

  onAfterMove();
}

function expandPoolToContainElement(shape) {
  const pool = shape.getParentCell();
  if (!pool || pool.get('type') !== 'processmaker.modeler.bpmn.pool') {
    return;
  }

  pool.component.expandToFitElement(shape, pool);

  if (!pool.component.laneSet) {
    return;
  }

  pool.component.updateLaneChildren();
}

export function keydownListener(event) {
  const formElementHasFocus = event.target.toString().toLowerCase().indexOf('body') === -1;
  if (formElementHasFocus) {
    return;
  }

  moveShapeByKeypress(
    event.key,
    store.getters.highlightedShape,
    this.pushToUndoStack,
  );
}
