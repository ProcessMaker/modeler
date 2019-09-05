import { g } from 'jointjs';
import { id as poolId } from '@/components/nodes/pool';
import validBoundaryEventTargets from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';

export function validateDropTarget(clientX, clientY, control, paper, graph, collaboration) {
  if (!isPointOverPaper(clientX, clientY, paper)) {
    return false;
  }

  if (isDroppingPool(control.type)) {
    return true;
  }

  if (isDraggingBoundaryEvent(control.bpmnType)) {
    return isOverBoundaryEventTarget(clientX, clientY, paper, graph);
  }

  if (noPoolsOnTheGrid(collaboration)) {
    return true;
  }

  if (getPoolUnderPosition(clientX, clientY, paper, graph)) {
    return true;
  }

  return false;
}

export function getPoolUnderPosition(clientX, clientY, paper, graph) {
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

function isPointOverPaper(mouseX, mouseY, paper) {
  const { left, top, width, height } = paper.el.getBoundingClientRect();
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
