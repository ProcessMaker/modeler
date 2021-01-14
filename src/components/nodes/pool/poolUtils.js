import { util } from 'jointjs';
import { poolColor } from '@/components/nodeColors';
import { labelWidth, poolPadding } from '@/components/nodes/pool/poolSizes';
import PoolShape from '@/components/nodes/pool/poolShape';
import { id as laneId } from '@/components/nodes/poolLane/config';
import { id as textAnnotationId } from '@/components/nodes/textAnnotation';
import { id as dataObjectId } from '@/components/nodes/dataObject';
import { id as dataStoreId } from '@/components/nodes/dataStore';

function createPool(node, graph) {
  const pool = new PoolShape();
  const bounds = node.diagram.bounds;
  pool.position(bounds.x, bounds.y);
  pool.resize(bounds.width, bounds.height);
  pool.attr('label/text', util.breakText(node.definition.get('name'), {
    width: bounds.width,
  }));
  pool.attr('body', {
    fill: poolColor,
  });
  pool.addTo(graph);
  return pool;
}

function addAllElementsToPool(graph, pool) {
  graph
    .getElements()
    .filter((shape) => shape !== pool)
    .filter(({ component }) => !component.node.isBpmnType('bpmn:BoundaryEvent'))
    .forEach(({ component }) => {
      pool.embed(component.shape);
      component.node.pool = pool;
    });
}

function sizePool(pool, node) {
  pool.fitEmbeds({ padding: poolPadding + labelWidth });
  pool.resize(
    pool.getBBox().width - labelWidth,
    pool.getBBox().height - labelWidth,
  );
  pool.resize(
    pool.getBBox().width,
    pool.getBBox().height - labelWidth,
    { direction: 'top' },
  );

  const { width, height } = pool.get('size');
  const bounds1 = node.diagram.bounds;

  pool.resize(
    /* Add labelWidth to ensure elements don't overlap with the pool label */
    Math.max(width, bounds1.width),
    Math.max(height, bounds1.height),
  );
}

export function configurePool(collaboration, node, graph) {
  const pool = createPool(node, graph);
  if (collaboration) {
    return pool;
  }
  addAllElementsToPool(graph, pool);
  sizePool(pool, node);

  return pool;
}

export function elementShouldHaveFlowNodeRef(element) {
  return element.component &&
    element.component.node.type !== laneId &&
    element.component.node.type !== textAnnotationId &&
    element.component.node.type !== dataObjectId &&
    element.component.node.type !== dataStoreId;
}
