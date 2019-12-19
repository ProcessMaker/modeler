import PaperManager from '@/components/paperManager';

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

export default function moveShapeByKeypress(key, shape) {
  if (!shape || invalidTypes.includes(shape.get('type'))) {
    return;
  }
  const match = key.match(/^(?:Arrow)?(Up|Down|Left|Right)$/);
  const keyCode = match ? match[1] : undefined;

  const [tx, ty] = translationAmount.get(keyCode) || [0, 0];
  shape.translate(tx, ty);

  expandPoolToContainElement(shape);
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
