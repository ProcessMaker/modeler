import isValidBoundaryEventTarget from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { getEmptyBoundaryEventPositionsForShape } from '@/portsUtils';

export function canAddBoundaryEventToTarget(boundaryEventType, dropTarget) {
  if (!dropTarget || !isValidBoundaryEventTarget(dropTarget.component)) {
    return false;
  }

  return getEmptyBoundaryEventPositionsForShape(dropTarget).length !== 0;
}

export function isValidBoundaryEscalationEvent(component) {
  return component && component.node.isBpmnType('bpmn:CallActivity');
}
