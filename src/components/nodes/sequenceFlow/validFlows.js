import { id as laneId } from '../poolLane';
import get from 'lodash/get';
import { id as laneId } from '@/components/nodes/poolLane/config';

export function isValidSequenceFlowConnection(sourceShape, targetShape) {
  const sourceNode = get(sourceShape, 'component.node');
  const targetNode = get(targetShape, 'component.node');

  return hasTargetType(targetShape) &&
    targetIsNotALane(targetNode) &&
    targetIsInSamePool(sourceShape, targetShape) &&
    targetIsNotSource(sourceNode, targetNode) &&
    eventBasedGatewayTarget(sourceNode, targetNode);
}

export function isValidSource(sourceShape, targetConfig) {
  return targetConfig.validateIncoming == null ||
    targetConfig.validateIncoming(sourceShape.node);
}

export function hasTargetType(targetShape) {
  return get(targetShape, 'component.node.type') != null;
}

export function targetIsNotALane(targetNode) {
  return !targetNode.isType(laneId);
}

export function targetIsInSamePool(sourceShape, target) {
  const targetPool = target.component.node.pool;
  const sourcePool = sourceShape.component.node.pool;

  return !sourcePool || sourcePool === targetPool;
}

export function targetIsNotSource(sourceNode, targetNode) {
  return targetNode.id !== sourceNode.id;
}

export function eventBasedGatewayTarget(sourceNode, targetNode) {
  const isSourceEventBasedGateway = sourceNode.isBpmnType('bpmn:EventBasedGateway');
  const isTargetIntermediateCatchEvent = targetNode.isBpmnType('bpmn:IntermediateCatchEvent');

  return !isSourceEventBasedGateway || isTargetIntermediateCatchEvent;
}
