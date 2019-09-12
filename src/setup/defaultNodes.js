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
  boundaryTimerEvent,
];

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode, registerBpmnExtension }) => {
  registerNode(startEvent);
  registerNode(startTimerEvent, definition => {
    const eventDefinitions = definition.get('eventDefinitions');
    if (definition.$type === 'bpmn:StartEvent' && eventDefinitions && eventDefinitions.length && eventDefinitions[0].$type === 'bpmn:TimerEventDefinition') {
      return startTimerEvent.id;
    }
  });

  registerNode(intermediateTimerEvent, definition => {
    const eventDefinitions = definition.get('eventDefinitions');
    if (definition.$type === 'bpmn:IntermediateCatchEvent' && eventDefinitions && eventDefinitions.length && eventDefinitions[0].$type === 'bpmn:TimerEventDefinition') {
      return intermediateTimerEvent.id;
    }
  });

  registerNode(intermediateMessageCatchEvent, definition => {
    const eventDefinitions = definition.get('eventDefinitions');
    if (definition.$type === 'bpmn:IntermediateCatchEvent' && eventDefinitions && eventDefinitions.length && eventDefinitions[0].$type === 'bpmn:MessageEventDefinition') {
      return intermediateMessageCatchEvent.id;
    }
  });

  /* Register basic node types */
  nodeTypes.forEach(config => registerNode(config));

  /* Add a BPMN extension */
  registerBpmnExtension('pm', bpmnExtension);
});
