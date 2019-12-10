import isValidBoundaryEventTarget from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { getEmptyBoundaryEventPositionsForShape } from '@/portsUtils';

export function canAddBoundaryEventToTarget(boundaryEventType, dropTarget) {
  if (!dropTarget || !isValidBoundaryEventTarget(dropTarget.component)) {
    return false;
  }

  if (getEmptyBoundaryEventPositionsForShape(dropTarget).length === 0) {
    return false;
  }

  if (boundaryEventType === 'processmaker-modeler-boundary-error-event') {
    return getAttachedErrorBoundaryEvents(dropTarget).length === 0;
  }

  if (boundaryEventType === 'processmaker-modeler-boundary-message-event') {
    return dropTarget.component.node.definition.$type === 'bpmn:CallActivity';
  }

  return true;
}

export function isValidBoundaryEscalationEvent(component) {
  return component && component.node.definition.$type === 'bpmn:CallActivity';
}

export function getAttachedErrorBoundaryEvents(shape) {
  return shape
    .getEmbeddedCells()
    .filter(({ component }) => component && component.node.type === 'processmaker-modeler-boundary-error-event');
}
