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

    // Select all elements
    cy.get('.paper-container').as('paperContainer').click();
    cy.get('.paper-container').trigger('mousedown', 'topLeft');
    cy.get('.paper-container').trigger('mousemove', 'bottomRight');
    waitToRenderAllShapes();
    cy.get('.paper-container').trigger('mouseup', 'bottomRight');

    // Validation 1: Verify that controls are selected inside a selection box
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"] [data-cy="selected"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.task.Shape"] [data-cy="selected"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"] [data-cy="selected"]').should('exist');
    // Check the selection is large enough to contain all elements
    cy.get('[data-cy="selection-box"]').then($selectionBox => {
      const selectionBoxWidth = $selectionBox.width();
      expect(selectionBoxWidth).to.be.greaterThan(400);
    });

    //Validation 2: Click in the task the task must be selected
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
