import get from 'lodash/get';
import { id as poolId } from '@/components/nodes/pool/config';

export default class Flow {
  nodeRegistry;
  moddle;
  paper;

  constructor(nodeRegistry, moddle, paper) {
    this.nodeRegistry = nodeRegistry;
    this.moddle = moddle;
    this.paper = paper;
  }

  // eslint-disable-next-line no-unused-vars
  static isValid(sourceShape, targetShape, sourceConfig) {
    throw new Error('Best practice is to implement \'isValid\' in each class');
  }

  // eslint-disable-next-line no-unused-vars
  makeFlowNode(sourceShape, targetShape, genericLink) {
    throw new Error('Best practice is to implement \'makeFlowDefinition\' in each class');
  }

  static hasTargetType(targetShape) {
    return get(targetShape, 'component.node.type') != null;
  }

  static targetIsValidStartEventType(targetNode) {
    if (!targetNode.isBpmnType('bpmn:StartEvent')) {
      return true;
    }

    return targetNode.isType('processmaker-modeler-message-start-event');
  }

  static targetIsValidIntermediateEventType(targetNode) {
    if (!targetNode.isBpmnType('bpmn:IntermediateCatchEvent')) {
      return true;
    }

    return targetNode.isType('processmaker-modeler-intermediate-message-catch-event');
  }

  static targetIsValidBoundaryEventType(targetNode) {
    if (!targetNode.isBpmnType('bpmn:BoundaryEvent')) {
      return true;
    }

    return targetNode.isType('processmaker-modeler-boundary-message-event');
  }

  static targetIsNotContainingPool(target, sourceNode) {
    return target !== sourceNode.pool;
  }

  static targetIsInDifferentPool(target, sourceShape) {
    const targetPool = Flow.shapeIsPool(target) ? target : target.component.node.pool;
    const sourcePool = Flow.shapeIsPool(sourceShape) ? sourceShape : sourceShape.component.node.pool;

    return sourcePool != null && sourcePool !== targetPool;
  }

  static targetIsNotSource(targetNode, sourceNode) {
    return targetNode.id !== sourceNode.id;
  }

  static allowOutgoingFlow(sourceConfig, sourceNode) {
    if ('allowOutgoingFlow' in sourceConfig) {
      return sourceConfig.allowOutgoingFlow(sourceNode);
    }

    return true;
  }

  static shapeIsPool(shape){
    const shapeType = get(shape, 'component.node.type');
    return shapeType === poolId;
  }
}
