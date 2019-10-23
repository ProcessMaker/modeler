import { g } from 'jointjs';
import { id as poolId } from '@/components/nodes/pool';
import validBoundaryEventTargets from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { id as boundaryErrorEventId } from '@/components/nodes/boundaryErrorEvent';
import { id as boundaryEscalationEventId } from '@/components/nodes/boundaryEscalationEvent';

const validBoundaryEscalationEventTarget = 'bpmn:CallActivity';

export default function getValidationProperties(clientX, clientY, control, paper, graph, collaboration, paperContainer) {
  const returnValue = {
    allowDrop: false,
    poolTarget: null,
  };
  if (!isPointOverPaper(clientX, clientY, paperContainer)) {
    returnValue.allowDrop = false;
    return returnValue;
  }

  if (isDroppingPool(control.type)) {
    returnValue.allowDrop = true;
    return returnValue;
  }

  if (isDraggingBoundaryEvent(control.bpmnType)) {
    if (isBoundaryErrorEvent(control.type)) {
      returnValue.allowDrop = isOverValidBoundaryErrorEventTarget(clientX, clientY, paper, graph);
      return returnValue;
    }
    if (isBoundaryEscalationEvent(control.type)) {
      returnValue.allowDrop = isOverValidBoundaryEscalationEventTarget(clientX, clientY, paper, graph);
      return returnValue;
    }

    returnValue.allowDrop = isOverBoundaryEventTarget(clientX, clientY, paper, graph);
    return returnValue;
  }

  if (noPoolsOnTheGrid(collaboration)) {
    returnValue.allowDrop = true;
    return returnValue;
  }

  let poolUnderPosition = getPoolUnderPosition(clientX, clientY, paper, graph);
  if (poolUnderPosition) {
    returnValue.allowDrop = true;
    returnValue.poolTarget = poolUnderPosition;
  }

  return returnValue;
}

function getPoolUnderPosition(clientX, clientY, paper, graph) {
  return graph
    .findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
    .find(({ component }) => {
      return component && component.node.type === poolId;
    });
}

function isDroppingPool(controlType) {
  return controlType === poolId;
}

function noPoolsOnTheGrid(collaboration) {
  return !collaboration || collaboration.get('participants').length === 0;
}

function isPointOverPaper(mouseX, mouseY, paperContainer) {
  const { left, top, width, height } = paperContainer.getBoundingClientRect();
  const rect = new g.rect(left, top, width, height);
  const point = new g.Point(mouseX, mouseY);

  return rect.containsPoint(point);
}

function isDraggingBoundaryEvent(bpmnType) {
  return bpmnType === 'bpmn:BoundaryEvent';
}

function getLocalMousePosition(clientX, clientY, paper) {
  return paper.clientToLocalPoint({
    x: clientX,
    y: clientY,
  });
}

function isOverBoundaryEventTarget(clientX, clientY, paper, graph) {
  return graph
    .findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
    .some(({ component }) => {
      return component && validBoundaryEventTargets.includes(component.node.definition.$type);
    });
}

function isOverValidBoundaryErrorEventTarget(clientX, clientY, paper, graph) {
  const target = graph
    .findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
    .find(({ component }) => component && validBoundaryEventTargets.includes(component.node.definition.$type));

  if (!target || getAttachedErrorBoundaryEvents(target).length > 0) {
    return false;
  }

  return true;
}

function isOverValidBoundaryEscalationEventTarget(clientX, clientY, paper, graph) {
  return graph.findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper)).
    find(({ component }) => isValidBoundaryEscalationEvent(component));
}

function isValidBoundaryEscalationEvent(component) {
  return component && component.node.definition.$type === validBoundaryEscalationEventTarget;
}

function isBoundaryErrorEvent(type) {
  return type === boundaryErrorEventId;
}

function isBoundaryEscalationEvent(type) {
  return type === boundaryEscalationEventId;
}

export function getAttachedErrorBoundaryEvents(shape) {
  return shape
    .getEmbeddedCells()
    .filter(({ component }) => component && isBoundaryErrorEvent(component.node.type));
}
