import { util } from 'jointjs';
import { poolColor } from '@/components/nodeColors';
import { labelWidth, poolPadding } from '@/components/nodes/pool/poolSizes';
import PoolShape from '@/components/nodes/pool/poolShape';

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
    originalFill: poolColor,
  });
  pool.addTo(graph);
  return pool;
}

function addAllElementsToPool(graph, pool) {
  graph
    .getElements()
    .filter((shape) => shape !== pool)
    .filter(({ component }) => component.node.definition.$type !== 'bpmn:BoundaryEvent')
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
