import isValidBoundaryEventTarget from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { getEmptyBoundaryEventPositionsForShape } from '@/portsUtils';

export function canAddBoundaryEventToTarget(boundaryEventType, dropTarget) {
  if (!dropTarget || !isValidBoundaryEventTarget(dropTarget.component)) {
    return false;
  }

  if (getEmptyBoundaryEventPositionsForShape(dropTarget).length === 0) {
    return false;
  }

  return true;
}

export function isValidBoundaryEscalationEvent(component) {
  return component && component.node.definition.$type === 'bpmn:CallActivity';
}
