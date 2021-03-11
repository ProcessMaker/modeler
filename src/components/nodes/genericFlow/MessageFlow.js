import Flow from '@/components/nodes/genericFlow/Flow';
import get from 'lodash/get';
import Node from '@/components/nodes/node';

export default class MessageFlow extends Flow {
  static isValid({ sourceShape, targetShape, sourceConfig }) {
    const targetNode = get(targetShape, 'component.node');
    const sourceNode = get(sourceShape, 'component.node');

    return Flow.hasTargetType(targetShape) &&
      MessageFlow.isValidTargetType(targetNode) &&
      Flow.targetIsValidStartEventType(targetNode) &&
      Flow.targetIsValidIntermediateEventType(targetNode) &&
      Flow.targetIsValidBoundaryEventType(targetNode) &&
      Flow.targetIsNotContainingPool(targetShape, sourceNode) &&
      Flow.targetIsInDifferentPool(targetShape, sourceShape) &&
      Flow.targetIsNotSource(targetNode, sourceNode) &&
      Flow.allowOutgoingFlow(sourceConfig, sourceNode);
  }

  makeFlowNode(sourceShape, targetShape, genericLink) {
    const diagram = this.nodeRegistry['processmaker-modeler-message-flow'].diagram(this.moddle);
    const messageFlowDefinition = this.nodeRegistry['processmaker-modeler-message-flow'].definition(this.moddle);

    messageFlowDefinition.set('sourceRef', sourceShape.component.node.definition);
    messageFlowDefinition.set('targetRef', targetShape.component.node.definition);

    const start = genericLink.sourceAnchor;
    const end = genericLink.targetAnchor;

    diagram.waypoint = [start, end].map(point => this.moddle.create('dc:Point', point));

    return new Node(
      'processmaker-modeler-message-flow',
      messageFlowDefinition,
      diagram,
    );
  }

  static isValidTargetType(targetNode) {
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
}
