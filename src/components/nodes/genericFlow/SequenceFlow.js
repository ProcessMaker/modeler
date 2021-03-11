import Flow from '@/components/nodes/genericFlow/Flow';
import get from 'lodash/get';
import Node from '@/components/nodes/node';
import { id as laneId } from '@/components/nodes/poolLane/config';
import DataAssociation from '@/components/nodes/genericFlow/DataAssociation';

export default class SequenceFlow extends Flow {
  static isValid({ sourceShape, targetShape, targetConfig }) {
    const targetNode = get(targetShape, 'component.node');
    const sourceNode = get(sourceShape, 'component.node');

    return Flow.hasTargetType(targetShape) &&
      Flow.targetIsNotSource(sourceNode, targetNode) &&
      SequenceFlow.targetIsNotALane(targetNode) &&
      SequenceFlow.targetIsInSamePool(sourceShape, targetShape) &&
      SequenceFlow.eventBasedGatewayTarget(sourceNode, targetNode) &&
      SequenceFlow.isValidSource(sourceShape, targetConfig) &&
      SequenceFlow.sourceIsNotPool(sourceNode) &&
      !DataAssociation.isADataNode(sourceNode) &&
      !DataAssociation.isADataNode(targetNode);
  }

  makeFlowNode(sourceShape, targetShape, genericLink) {
    const diagram = this.nodeRegistry['processmaker-modeler-sequence-flow'].diagram(this.moddle);
    const sequenceFlowDefinition = this.nodeRegistry['processmaker-modeler-sequence-flow'].definition(this.moddle, this.$t);

    sequenceFlowDefinition.set('sourceRef', sourceShape.component.node.definition);
    sequenceFlowDefinition.set('targetRef', targetShape.component.node.definition);

    const start = genericLink.sourceAnchor;
    const end = genericLink.targetAnchor;

    diagram.waypoint = [start, end].map(point => this.moddle.create('dc:Point', point));

    if (
      sequenceFlowDefinition.sourceRef.$type === 'bpmn:ExclusiveGateway' ||
      sequenceFlowDefinition.sourceRef.$type === 'bpmn:InclusiveGateway') {
      sequenceFlowDefinition.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
        body: '',
      });
    }

    sourceShape.component.node.definition.get('outgoing').push(sequenceFlowDefinition);
    targetShape.component.node.definition.get('incoming').push(sequenceFlowDefinition);

    return new Node(
      'processmaker-modeler-sequence-flow',
      sequenceFlowDefinition,
      diagram,
    );
  }

  static isValidSource(sourceShape, targetConfig) {
    return targetConfig.validateIncoming == null ||
      targetConfig.validateIncoming(sourceShape.node);
  }

  static targetIsNotALane(targetNode) {
    return !targetNode.isType(laneId);
  }

  static targetIsInSamePool(sourceShape, target) {
    const targetPool = target.component.node.pool;
    const sourcePool = sourceShape.component.node.pool;

    return !sourcePool || sourcePool === targetPool;
  }

  static targetIsNotSource(sourceNode, targetNode) {
    return targetNode.id !== sourceNode.id;
  }

  static eventBasedGatewayTarget(sourceNode, targetNode) {
    const isSourceEventBasedGateway = sourceNode.isBpmnType('bpmn:EventBasedGateway');
    const isTargetIntermediateCatchEvent = targetNode.isBpmnType('bpmn:IntermediateCatchEvent');

    return !isSourceEventBasedGateway || isTargetIntermediateCatchEvent;
  }
  static sourceIsNotPool(sourceNode) {
    return !sourceNode.isType('processmaker-modeler-pool');
  }
}
