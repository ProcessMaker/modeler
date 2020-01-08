import { id as poolId } from './nodes/pool';
import { id as laneId } from '@/components/nodes/poolLane';

export function addNodeToProcess(node, targetProcess) {
  if (node.isType(poolId) || node.isBpmnType('bpmn:MessageFlow')) {
    return;
  }

  if (node.isType(laneId)) {
    targetProcess
      .get('laneSets')[0]
      .get('lanes')
      .push(node.definition);
    return;
  }

  let target = 'flowElements';
  if (node.isBpmnType('bpmn:TextAnnotation') || node.isBpmnType('bpmn:Association')) {
    target = 'artifacts';
  }

  targetProcess.get(target).push(node.definition);
}
