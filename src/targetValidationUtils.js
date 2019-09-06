import { g } from 'jointjs';
import { id as poolId } from '@/components/nodes/pool';
import validBoundaryEventTargets from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';

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
