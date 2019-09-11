/* Expression example */
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker.json';
/* Our initial node types to register with our modeler */
import {
  association,
  boundaryEvent,
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
  boundaryEvent,
];
const eventDefinitions = 'eventDefinitions';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode, registerBpmnExtension }) => {
  registerNode(startEvent);
  registerNode(startTimerEvent, definition => {
    const definitions = definition.get(eventDefinitions);
    if (definition.$type === 'bpmn:StartEvent' && definitions && definitions.length && definitions[0].$type === 'bpmn:TimerEventDefinition') {
      return startTimerEvent.id;
    }
  });

  registerNode(intermediateTimerEvent, definition => {
    const definitions = definition.get(eventDefinitions);
    if (definition.$type === 'bpmn:IntermediateCatchEvent' && definitions && definitions.length && definitions[0].$type === 'bpmn:TimerEventDefinition') {
      return intermediateTimerEvent.id;
    }
  });

  registerNode(intermediateMessageCatchEvent, definition => {
    const definitions = definition.get(eventDefinitions);
    if (definition.$type === 'bpmn:IntermediateCatchEvent' && definitions && definitions.length && definitions[0].$type === 'bpmn:MessageEventDefinition') {
      return intermediateMessageCatchEvent.id;
    }
  });

  registerNode(boundaryTimerEvent, definition => {
    const definitions = definition.get(eventDefinitions);
    if (definition.$type !== 'bpmn:BoundaryEvent' || !definitions) {
      return false;
    }
    if (definitions[0].$type === 'bpmn:TimerEventDefinition') {
      return boundaryTimerEvent.id;
    }
  });

  /* Register basic node types */
  nodeTypes.forEach(config => registerNode(config));

  /* Add a BPMN extension */
  registerBpmnExtension('pm', bpmnExtension);
});
