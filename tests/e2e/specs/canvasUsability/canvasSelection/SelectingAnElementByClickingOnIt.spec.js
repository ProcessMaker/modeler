import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  waitToRenderAllShapes,
  getElementAtPosition,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Canvas Selection', () => {
  it('Verify that controls are selected when the user click on it', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskFormPosition = {
      x: startEventPosition.x + 200,
      y: startEventPosition.y,
    };
    const endEventPosition = {
      x: taskFormPosition.x + 200,
      y: taskFormPosition.y,
    };

    // Drag a Task Form
    dragFromSourceToDest(nodeTypes.task, taskFormPosition);

    // Connect the Start Event with Task Form
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskFormPosition);

    // Drag an End Event
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);

    // Connect the Task Form with End Event
    connectNodesWithFlow('generic-flow-button', taskFormPosition, endEventPosition);

    waitToRenderAllShapes();
    
    // Validation 1: Click in the task the task must be selected
    getElementAtPosition(taskFormPosition).click();

    cy.get('[data-cy="selection-box"]').then($selectionBox => {
      const { top: newTop, left: newLeft } = $selectionBox.position();
      expect(newTop).to.be.greaterThan(100);
      expect(newTop).to.be.lessThan(200);
      expect(newLeft).to.be.greaterThan(480);
      expect(newLeft).to.be.lessThan(530);
    });
  });
});
