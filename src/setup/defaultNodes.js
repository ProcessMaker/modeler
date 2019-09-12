/* Expression example */
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker.json';
/* Our initial node types to register with our modeler */
import {
  association,
  boundaryTimerEvent,
  callActivity,
  endEvent,
  eventBasedGateway,
  exclusiveGateway,
  inclusiveGateway,
  intermediateMessageCatchEvent,
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

const nodeTypes = [
  endEvent,
  task,
  callActivity,
  scriptTask,
  manualTask,
  serviceTask,
  exclusiveGateway,
  parallelGateway,
  inclusiveGateway,
  eventBasedGateway,
  sequenceFlow,
  messageFlow,
  textAnnotation,
  association,
  pool,
  poolLane,
];
const timerEventNodes = [
  [startTimerEvent, 'bpmn:StartEvent', 'bpmn:TimerEventDefinition'],
  [intermediateTimerEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:TimerEventDefinition'],
  [intermediateMessageCatchEvent, 'bpmn:IntermediateCatchEvent', 'bpmn:MessageEventDefinition'],
  [boundaryTimerEvent, 'bpmn:BoundaryEvent', 'bpmn:TimerEventDefinition'],
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
window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode, registerBpmnExtension }) => {
  registerNode(startEvent);
  timerEventNodes.forEach(([nodeType, primaryIdentifier, secondaryIdentifier]) => {
    registerNode(nodeType, customParserFactory(nodeType, primaryIdentifier, secondaryIdentifier));
  });

  /* Register basic node types */
  nodeTypes.forEach(config => registerNode(config));

  /* Add a BPMN extension */
  registerBpmnExtension('pm', bpmnExtension);
});
