import { nodeTypes } from '../support/constants';
import { CommonBoundaryEventBehaviour } from '../support/BoundaryEventCommonBehaviour';

CommonBoundaryEventBehaviour({
  type: 'Boundary Error Event',
  nodeType: nodeTypes.boundaryErrorEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="Boundary Error Event" attachedToRef="node_2"><bpmn:errorEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  taskTypeSelector: 'switch-to-user-task',
  invalidTargets: [{ type: nodeTypes.startEvent }],
});
