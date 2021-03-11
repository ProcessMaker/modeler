import { g } from 'jointjs';
import { id as poolId } from '@/components/nodes/pool/config';
import { canAddBoundaryEventToTarget } from '@/boundaryEventValidation';

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
    const dropTarget = graph
      .findModelsFromPoint(getLocalMousePosition(clientX, clientY, paper))
      .sort((shape1, shape2) => {
        /* Sort shape views by z-index descending; the shape "on top" will be first in array. */
        return shape2.get('z') - shape1.get('z');
      })[0];

    returnValue.allowDrop = canAddBoundaryEventToTarget(control.type, dropTarget);
    return returnValue;
  }

  if (noPoolsOnTheGrid(collaboration)) {
    returnValue.allowDrop = true;
    return returnValue;
  }

  if (isTextAnnotation(control.bpmnType)) {
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

function isTextAnnotation(bpmnType) {
  return bpmnType === 'bpmn:TextAnnotation';
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

export function getLocalMousePosition(clientX, clientY, paper) {
  return paper.clientToLocalPoint({
    x: clientX,
    y: clientY,
  });
}

