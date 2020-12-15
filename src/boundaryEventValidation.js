import isValidBoundaryEventTarget from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { getEmptyBoundaryEventPositionsForShape } from '@/portsUtils';

export function canAddBoundaryEventToTarget(boundaryEventType, dropTarget) {
  if (!dropTarget || !isValidBoundaryEventTarget(dropTarget.component)) {
    return false;
  }

  if (boundaryEventType === 'processmaker-modeler-boundary-message-event') {
    return spaceAvailable(dropTarget);
  }

  return spaceAvailable(dropTarget);
}

export function isValidBoundaryEscalationEvent(component) {
  return component && component.node.isBpmnType('bpmn:CallActivity');
}

function spaceAvailable(dropTarget) {
  return getEmptyBoundaryEventPositionsForShape(dropTarget).length !== 0;
}
