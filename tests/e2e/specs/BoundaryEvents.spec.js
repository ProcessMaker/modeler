import {
  dragFromSourceToDest,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Boundary Events', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Drag a boundary event on task', () => {
    const taskPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 280, y: 300 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();
    getElementAtPosition(taskPosition).click();
  });
});
