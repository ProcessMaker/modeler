import { id as poolId } from './nodes/pool';
import { id as laneId } from '@/components/nodes/poolLane';

export function addIdToNodeAndSetUpDiagramReference(node, nodeIdGenerator) {
  const [nodeId, diagramId] = nodeIdGenerator.generate();

  if (!node.definition.id) {
    node.definition.id = nodeId;
  }

  if (node.diagram) {
    node.diagram.id = diagramId;
    node.diagram.bpmnElement = node.definition;
  }
}

export function addNodeToProcess(node, targetProcess) {
  if (node.isType(poolId) || node.isBpmnType('bpmn:MessageFlow')) {
    return;
  }

  if (node.type === laneId) {
    targetProcess
      .get('laneSets')[0]
      .get('lanes')
      .push(node.definition);
    return;
  }

  if (node.isBpmnType('bpmn:TextAnnotation') || node.isBpmnType('bpmn:Association')) {
    targetProcess.get('artifacts').push(node.definition);
    return;
  }

  targetProcess.get('flowElements').push(node.definition);
}

export function getTargetProcess(node, processes, processNode) {
  return node.pool
    ? processes.find(({id}) => id === node.pool.component.node.definition.get('processRef').id)
    : processNode.definition;
}
