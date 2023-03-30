import PaperManager from '@/components/paperManager';

export const moveAmount = PaperManager.gridSize / 2;

const translationVectors = new Map();
translationVectors.set('Up', [0, -moveAmount]);
translationVectors.set('Down', [0, moveAmount]);
translationVectors.set('Left', [-moveAmount, 0]);
translationVectors.set('Right', [moveAmount, 0]);

const immovableShapeTypes = [
  'PoolLane',
  'processmaker.components.nodes.boundaryEvent.Shape',
];

export default function moveShapeByKeypress(key, shapes, onAfterMove = () => {}) {
  if (!isArrowKey(key)) {
    return;
  }

  const moveableShapes = shapes.filter(isMovableShape);

  if (moveableShapes.length === 0) {
    return;
  }

  const [tx, ty] = getTranslationVector(key);

  moveableShapes.forEach(shape => {
    shape.translate(tx, ty, { movedWithArrowKeys: true });
    expandPoolToContainElement(shape);
  });

  onAfterMove();
}

function isArrowKey(key) {
  const arrows = ['up', 'down', 'left', 'right'];
  return arrows.some(direction => key.toLowerCase().includes(direction));
}

function isMovableShape(shape) {
  return shape && !immovableShapeTypes.includes(shape.get('type'));
}

function getTranslationVector(arrowKey) {
  const crossBrowserKeyMatch = arrowKey.match(/^(?:Arrow)?(Up|Down|Left|Right)$/);
  return crossBrowserKeyMatch !== null
    ? translationVectors.get(crossBrowserKeyMatch[1])
    : [0, 0];
}

function shapeParentIsAPool(pool) {
  return !pool || pool.get('type') !== 'processmaker.modeler.bpmn.pool';
}

function expandPoolToContainElement(shape) {
  const pool = shape.getParentCell();
  if (shapeParentIsAPool(pool)) {
    return;
  }

  pool.component.expandToFitElement(shape, pool);

  if (!pool.component.laneSet) {
    return;
  }

  pool.component.updateLaneChildren();
}
