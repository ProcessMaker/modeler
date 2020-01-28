import { nodeTypes } from '../support/constants';
import { CommonBoundaryEventBehaviour } from './BoundaryEventCommonBehaviour.spec';

CommonBoundaryEventBehaviour({
  type: 'Boundary Error Event',
  nodeType: nodeTypes.boundaryErrorEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Error Event" attachedToRef="node_2"><bpmn:errorEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  taskTypeSelector: 'switch-to-user-task',
  invalidTargets: [{ type: nodeTypes.startEvent }],
});
