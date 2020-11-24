import {
  association,
  boundaryErrorEvent,
  boundaryEscalationEvent,
  boundaryMessageEvent,
  boundarySignalEvent,
  boundaryTimerEvent,
  boundaryConditionalEvent,
  conditionalStartEvent,
  dataInputAssociation,
  dataOutputAssociation,
  dataObject,
  dataStore,
  endEvent,
  errorEndEvent,
  eventBasedGateway,
  exclusiveGateway,
  inclusiveGateway,
  intermediateMessageCatchEvent,
  intermediateMessageThrowEvent,
  intermediateSignalCatchEvent,
  intermediateSignalThrowEvent,
  intermediateConditionalCatchEvent,
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
  terminateEndEvent,
  textAnnotation,
} from '@/components/nodes';
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker';

const nodeTypes = [
  startEvent,
  dataObject,
  dataStore,
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
  dataInputAssociation,
  dataOutputAssociation,
  pool,
  poolLane,
  textAnnotation,
];
const customEventNodes = [
  [signalStartEvent, 'bpmn:StartEvent', 'bpmn:SignalEventDefinition'],
  [startTimerEvent, 'bpmn:StartEvent', 'bpmn:TimerEventDefinition'],
  [messageStartEvent, 'bpmn:StartEvent', 'bpmn:MessageEventDefinition'],
  [conditionalStartEvent, 'bpmn:StartEvent', 'bpmn:ConditionalEventDefinition'],
  [intermediateTimerEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:TimerEventDefinition'],
  [intermediateMessageCatchEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:MessageEventDefinition'],
  [intermediateSignalCatchEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:SignalEventDefinition'],
  [intermediateMessageThrowEvent, 'bpmn:IntermediateThrowEvent', 'bpmn:MessageEventDefinition'],
  [intermediateSignalThrowEvent, 'bpmn:IntermediateThrowEvent', 'bpmn:SignalEventDefinition'],
  [intermediateConditionalCatchEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:ConditionalEventDefinition'],
  [boundaryTimerEvent, 'bpmn:BoundaryEvent', 'bpmn:TimerEventDefinition'],
  [boundaryErrorEvent, 'bpmn:BoundaryEvent', 'bpmn:ErrorEventDefinition'],
  [boundaryEscalationEvent, 'bpmn:BoundaryEvent', 'bpmn:EscalationEventDefinition'],
  [boundaryMessageEvent, 'bpmn:BoundaryEvent', 'bpmn:MessageEventDefinition'],
  [boundarySignalEvent, 'bpmn:BoundaryEvent', 'bpmn:SignalEventDefinition'],
  [boundaryConditionalEvent, 'bpmn:BoundaryEvent', 'bpmn:ConditionalEventDefinition'],
  [messageEndEvent, 'bpmn:EndEvent', 'bpmn:MessageEventDefinition'],
  [errorEndEvent, 'bpmn:EndEvent', 'bpmn:ErrorEventDefinition'],
  [signalEndEvent, 'bpmn:EndEvent', 'bpmn:SignalEventDefinition'],
  [terminateEndEvent, 'bpmn:EndEvent', 'bpmn:TerminateEventDefinition'],
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
