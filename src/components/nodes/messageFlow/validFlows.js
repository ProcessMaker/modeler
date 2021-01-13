import { id as poolId } from '@/components/nodes/pool';
import get from 'lodash/get';
import Node from '@/components/nodes/node';

export function isValidMessageFlowConnection(sourceShape, targetShape, sourceConfig) {
  const targetNode = get(targetShape, 'component.node');
  const sourceNode = get(sourceShape, 'component.node');

  return hasTargetType(targetShape) &&
      isValidTargetType(targetNode) &&
      targetIsValidStartEventType(targetNode) &&
      targetIsValidIntermediateEventType(targetNode) &&
      targetIsValidBoundaryEventType(targetNode) &&
      targetIsNotContainingPool(targetShape, sourceNode) &&
      targetIsInDifferentPool(targetShape, sourceShape) &&
      targetIsNotSource(targetNode, sourceNode) &&
      allowOutgoingFlow(sourceConfig, sourceNode);
}

export function addFlow(sourceShape, targetShape) {
  const diagram = this.nodeRegistry['processmaker-modeler-message-flow'].diagram(this.moddle);
  const messageFlowDefinition = this.nodeRegistry['processmaker-modeler-message-flow'].definition(this.moddle);
  const genericLink = this.shape.findView(this.paper);

  messageFlowDefinition.set('sourceRef', sourceShape.component.node.definition);
  messageFlowDefinition.set('targetRef', targetShape.component.node.definition);

  const start = genericLink.sourceAnchor;
  const end = genericLink.targetAnchor;

  diagram.waypoint = [start, end].map(point => this.moddle.create('dc:Point', point));

  this.$emit('add-node', new Node(
    'processmaker-modeler-message-flow',
    messageFlowDefinition,
    diagram,
  ));
}

function hasTargetType(targetShape) {
  return get(targetShape, 'component.node.type') != null;
}

function isValidTargetType(targetNode) {
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

function targetIsValidStartEventType(targetNode) {
  if (!targetNode.isBpmnType('bpmn:StartEvent')) {
    return true;
  }

  return targetNode.isType('processmaker-modeler-message-start-event');
}

function targetIsValidIntermediateEventType(targetNode) {
  if (!targetNode.isBpmnType('bpmn:IntermediateCatchEvent')) {
    return true;
  }

  return targetNode.isType('processmaker-modeler-intermediate-message-catch-event');
}

function targetIsValidBoundaryEventType(targetNode) {
  if (!targetNode.isBpmnType('bpmn:BoundaryEvent')) {
    return true;
  }

  return targetNode.isType('processmaker-modeler-boundary-message-event');
}

function targetIsNotContainingPool(target, sourceNode) {
  return target !== sourceNode.pool;
}

function targetIsInDifferentPool(target, sourceShape) {
  const targetPool = shapeIsPool(target) ? target : target.component.node.pool;
  const sourcePool = shapeIsPool(sourceShape) ? sourceShape : sourceShape.component.node.pool;

  return sourcePool != null && sourcePool !== targetPool;
}

function targetIsNotSource(targetNode, sourceNode) {
  return targetNode.id !== sourceNode.id;
}

function allowOutgoingFlow(sourceConfig, targetNode) {
  if ('allowOutgoingFlow' in sourceConfig) {
    return sourceConfig.allowOutgoingFlow(targetNode);
  }

  return true;
}

function shapeIsPool(shape){
  const shapeType = get(shape, 'component.node.type');
  return shapeType === poolId;
}

