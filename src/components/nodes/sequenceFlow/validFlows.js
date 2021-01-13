import { id as laneId } from '../poolLane';
import get from 'lodash/get';
import Node from '@/components/nodes/node';

export function isValidSequenceFlowConnection(sourceShape, targetShape) {
  const sourceNode = get(sourceShape, 'component.node');
  const targetNode = get(targetShape, 'component.node');

  return hasTargetType(targetShape) &&
    targetIsNotALane(targetNode) &&
    targetIsInSamePool(sourceShape, targetShape) &&
    targetIsNotSource(sourceNode, targetNode) &&
    eventBasedGatewayTarget(sourceNode, targetNode);
}

export function addFlow(sourceShape, targetShape) {
  const diagram = this.nodeRegistry['processmaker-modeler-sequence-flow'].diagram(this.moddle);
  const sequenceLink = this.nodeRegistry['processmaker-modeler-sequence-flow'].definition(this.moddle, this.$t);
  const genericLink = this.shape.findView(this.paper);

  sequenceLink.set('sourceRef', sourceShape.component.node.definition);
  sequenceLink.set('targetRef', targetShape.component.node.definition);

  const start = genericLink.sourceAnchor;
  const end = genericLink.targetAnchor;

  diagram.waypoint = [start, end].map(point => this.moddle.create('dc:Point', point));


  // eslint-disable-next-line no-console
  console.log('addFlow target', targetShape);

  // if (
  //   sequenceLink.sourceRef.$type === 'bpmn:ExclusiveGateway' ||
  //   sequenceLink.sourceRef.$type === 'bpmn:InclusiveGateway') {
  //   sequenceLink.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
  //     body: '',
  //   });
  // }

  this.$emit('add-node', new Node(
    'processmaker-modeler-sequence-flow',
    sequenceLink,
    diagram,
  ));
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
