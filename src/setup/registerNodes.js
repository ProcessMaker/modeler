import {
  association,
  boundaryErrorEvent,
  boundaryEscalationEvent,
  boundaryMessageEvent,
  boundarySignalEvent,
  boundaryTimerEvent,
  endEvent,
  errorEndEvent,
  eventBasedGateway,
  exclusiveGateway,
  inclusiveGateway,
  intermediateMessageCatchEvent,
  intermediateMessageThrowEvent,
  intermediateSignalCatchEvent,
  intermediateTimerEvent,
  manualTask,
  messageEndEvent,
  messageFlow,
  messageStartEvent,
  parallelGateway,
  pool,
  poolLane,
  scriptTask,
  sequenceFlow,
  serviceTask,
  signalEndEvent,
  signalStartEvent,
  startEvent,
  startTimerEvent,
  subProcess,
  task,
  textAnnotation,
} from '@/components/nodes';
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker';

const nodeTypes = [
  startEvent,
  endEvent,
  task,
  scriptTask,
  manualTask,
  subProcess,
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
  [signalStartEvent, 'bpmn:StartEvent', 'bpmn:SignalEventDefinition'],
  [startTimerEvent, 'bpmn:StartEvent', 'bpmn:TimerEventDefinition'],
  [messageStartEvent, 'bpmn:StartEvent', 'bpmn:MessageEventDefinition'],
  [intermediateTimerEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:TimerEventDefinition'],
  [intermediateMessageCatchEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:MessageEventDefinition'],
  [intermediateSignalCatchEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:SignalEventDefinition'],
  [intermediateMessageThrowEvent, 'bpmn:IntermediateThrowEvent', 'bpmn:MessageEventDefinition'],
  [boundaryTimerEvent, 'bpmn:BoundaryEvent', 'bpmn:TimerEventDefinition'],
  [boundaryErrorEvent, 'bpmn:BoundaryEvent', 'bpmn:ErrorEventDefinition'],
  [boundaryEscalationEvent, 'bpmn:BoundaryEvent', 'bpmn:EscalationEventDefinition'],
  [boundaryMessageEvent, 'bpmn:BoundaryEvent', 'bpmn:MessageEventDefinition'],
  [boundarySignalEvent, 'bpmn:BoundaryEvent', 'bpmn:SignalEventDefinition'],
  [messageEndEvent, 'bpmn:EndEvent', 'bpmn:MessageEventDefinition'],
  [errorEndEvent, 'bpmn:EndEvent', 'bpmn:ErrorEventDefinition'],
  [signalEndEvent, 'bpmn:EndEvent', 'bpmn:SignalEventDefinition'],
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
  customEventNodes.forEach(([nodeType, primaryIdentifier, secondaryIdentifier]) => {
    registerNode(nodeType, customParserFactory(nodeType, primaryIdentifier, secondaryIdentifier));
  });

  nodeTypes.forEach(config => registerNode(config));

  registerBpmnExtension('pm', bpmnExtension);
}
