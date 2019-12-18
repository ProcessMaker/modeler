import { id as poolId } from './nodes/pool';
import { id as laneId } from './nodes/poolLane';

export default function ensureShapeIsNotCovered(shape, graph) {
  if (isPool(shape)) {
    bringPoolToFront(shape);
  }

  const parentPool = getElementPool(shape);

  if (parentPool) {
    bringPoolToFront(parentPool);
  }

  if (isNotLane(shape) && !isPool(shape)) {
    bringShapeToFront(shape);
  }

  bringFlowsToFront(graph);
}

function isNotLane(shape) {
  return shape.component.node.type !== laneId;
}

function bringPoolToFront(poolShape) {
  bringShapeToFront(poolShape);

  const hasLanes = poolShape.component.node.definition.processRef.laneSets[0];
  if (!hasLanes) {
    return;
  }

  const poolLanes = poolShape
    .getEmbeddedCells()
    .filter(cell => cell.component && cell.component.node.type === laneId);
  const poolLaneElements = poolShape
    .getEmbeddedCells()
    .filter(cell => cell.component && cell.component.node.type !== laneId);

  poolLanes.forEach(bringShapeToFront);
  poolLaneElements.forEach(bringShapeToFront);
}

function bringShapeToFront(shape) {
  shape.toFront({ deep: true });
}

function bringFlowsToFront(graph) {
  graph.getLinks().forEach(bringShapeToFront);
}

function getElementPool(shape) {
  return shape.component.node.pool;
}

function isPool(shape) {
  return shape.component.node.type === poolId;
}

