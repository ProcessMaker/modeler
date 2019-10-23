import {
  association,
  boundaryErrorEvent,
  boundaryTimerEvent,
  boundaryEscalationEvent,
  callActivity,
  endEvent,
  eventBasedGateway,
  exclusiveGateway,
  inclusiveGateway,
  intermediateMessageCatchEvent,
  intermediateMessageThrowEvent,
  intermediateTimerEvent,
  manualTask,
  messageFlow,
  parallelGateway,
  pool,
  poolLane,
  scriptTask,
  sequenceFlow,
  serviceTask,
  startEvent,
  startTimerEvent,
  task,
  textAnnotation,
} from '@/components/nodes';
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker';

const nodeTypes = [
  endEvent,
  task,
  scriptTask,
  manualTask,
  callActivity,
  serviceTask,
  exclusiveGateway,
  inclusiveGateway,
  eventBasedGateway,
  parallelGateway,
  sequenceFlow,
  messageFlow,
  association,
  pool,
  poolLane,
  textAnnotation,
];
const customEventNodes = [
  [startTimerEvent, 'bpmn:StartEvent', 'bpmn:TimerEventDefinition'],
  [intermediateTimerEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:TimerEventDefinition'],
  [intermediateMessageCatchEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:MessageEventDefinition'],
  [intermediateMessageThrowEvent, 'bpmn:IntermediateThrowEvent', 'bpmn:MessageEventDefinition'],
  [boundaryTimerEvent, 'bpmn:BoundaryEvent', 'bpmn:TimerEventDefinition'],
  [boundaryErrorEvent, 'bpmn:BoundaryEvent', 'bpmn:ErrorEventDefinition'],
  [boundaryEscalationEvent, 'bpmn:BoundaryEvent', 'bpmn:EscalationEventDefinition'],
];
const customParserFactory = (nodeType, primaryIdentifier, secondaryIdentifier) => (definition) => {
  const definitions = definition.get('eventDefinitions');
  const validDefinition = definition.$type === primaryIdentifier
    && definitions
    && definitions.length
    && definitions[0].$type === secondaryIdentifier;
  if (validDefinition) {
    return nodeType.id;
  }
};

export default function registerNodes({ registerNode, registerBpmnExtension }) {
  registerNode(startEvent);
  customEventNodes.forEach(([nodeType, primaryIdentifier, secondaryIdentifier]) => {
    registerNode(nodeType, customParserFactory(nodeType, primaryIdentifier, secondaryIdentifier));
  });

  nodeTypes.forEach(config => registerNode(config));

  registerBpmnExtension('pm', bpmnExtension);
}
