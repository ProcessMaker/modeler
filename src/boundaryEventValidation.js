import { id as boundaryEscalationEventId } from '@/components/nodes/boundaryEscalationEvent';
import isValidBoundaryEventTarget from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { id as boundaryMessageEventId } from '@/components/nodes/boundaryMessageEvent';
import { id as boundaryErrorEventId } from '@/components/nodes/boundaryErrorEvent';
import { getLocalMousePosition } from './targetValidationUtils';

const validBoundaryEscalationEventTarget = 'bpmn:CallActivity';

export function canAddBoundaryEventToTarget(boundaryEventType, clientX, clientY, paper, graph) {
  if (isBoundaryErrorEvent(boundaryEventType)) {
    return isOverValidBoundaryErrorEventTarget(clientX, clientY, paper, graph);
  }

  if (boundaryEventType === boundaryEscalationEventId) {
    return isOverValidBoundaryEscalationEventTarget(clientX, clientY, paper, graph);
  }

  if (boundaryEventType === boundaryMessageEventId) {
    return isOverValidBoundaryMessageEventTarget(clientX, clientY, paper, graph);
  }

  return isOverBoundaryEventTarget(clientX, clientY, paper, graph);
}

function isOverValidBoundaryMessageEventTarget(clientX, clientY, paper, graph) {
  return graph
    .findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
    .some(({ component }) => component && component.node.definition.$type === 'bpmn:CallActivity');
}

function isOverBoundaryEventTarget(clientX, clientY, paper, graph) {
  return graph
    .findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
    .some(({ component }) => {
      return isValidBoundaryEventTarget(component);
    });
}

function isOverValidBoundaryErrorEventTarget(clientX, clientY, paper, graph) {
  const target = graph
    .findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
    .find(({ component }) => isValidBoundaryEventTarget(component));

  if (!target || getAttachedErrorBoundaryEvents(target).length > 0) {
    return false;
  }

  return true;
}

export function isValidBoundaryEscalationEvent(component) {
  return component && component.node.definition.$type === validBoundaryEscalationEventTarget;
}

function isOverValidBoundaryEscalationEventTarget(clientX, clientY, paper, graph) {
  return graph.findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
    .find(({ component }) => isValidBoundaryEscalationEvent(component));
}

function isBoundaryErrorEvent(type) {
  return type === boundaryErrorEventId;
}


export function getAttachedErrorBoundaryEvents(shape) {
  return shape
    .getEmbeddedCells()
    .filter(({ component }) => component && isBoundaryErrorEvent(component.node.type));
}
