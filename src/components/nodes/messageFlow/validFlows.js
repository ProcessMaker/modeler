import { id as poolId } from '@/components/nodes/pool';
import get from 'lodash/get';

export function isValidTargetType(targetNode) {
  return [
    'bpmn:Task',
    'bpmn:ScriptTask',
    'bpmn:ManualTask',
    'bpmn:CallActivity',
    'bpmn:ServiceTask',
    'bpmn:IntermediateCatchEvent',
    'bpmn:Participant',
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
  ].some(type => targetNode.isBpmnType(type));
}

export function targetIsValidStartEventType(targetNode) {
  if (!targetNode.isBpmnType('bpmn:StartEvent')) {
    return true;
  }

  return targetNode.isType('processmaker-modeler-message-start-event');
}

export function targetIsValidIntermediateEventType(targetNode) {
  if (!targetNode.isBpmnType('bpmn:IntermediateCatchEvent')) {
    return true;
  }

  return targetNode.isType('processmaker-modeler-intermediate-message-catch-event');
}

export function targetIsValidBoundaryEventType(targetNode) {
  if (!targetNode.isBpmnType('bpmn:BoundaryEvent')) {
    return true;
  }

  return targetNode.isType('processmaker-modeler-boundary-message-event');
}

export function targetIsNotContainingPool(target, sourceNode) {
  return target !== sourceNode.pool;
}

export function targetIsInDifferentPool(target, sourceShape) {
  const targetPool = shapeIsPool(target) ? target : target.component.node.pool;
  const sourcePool = shapeIsPool(sourceShape) ? sourceShape : sourceShape.component.node.pool;

  return sourcePool != null && sourcePool !== targetPool;
}

export function targetIsNotSource(targetNode, sourceNode) {
  return targetNode.id !== sourceNode.id;
}

function shapeIsPool(shape){
  const shapeType = get(shape, 'component.node.type');
  return shapeType === poolId;
}

