import {
  dragFromSourceToDest,
  getElementAtPosition,
  getGraphElements,
  getCrownButtonForElement,
} from '../support/utils';

describe('Undo/redo', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can undo and redo adding a task', () => {
    const taskPosition = { x: 300, y: 500 };

    dragFromSourceToDest('processmaker-modeler-task', '.paper-container', taskPosition);

    cy.get('[data-test=undo]').click();

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=redo]').click();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo and redo deleting a task', () => {
    const taskPosition = { x: 300, y: 500 };

    dragFromSourceToDest('processmaker-modeler-task', '.paper-container', taskPosition);

    /* Wait for jointjs to render the shape */
    cy.wait(100);

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click();
      });

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=undo]').click();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo position changes', () => {
    const startEventPosition = { x: 150, y: 150 };
    const startEventMoveToPosition = { x: 300, y: 300 };

    cy.get('[data-test=undo]')
      .should('be.disabled');

    cy.wait(100);

    getElementAtPosition(startEventPosition)
      .moveTo(startEventMoveToPosition.x, startEventMoveToPosition.y)
      .should(position => {
        expect(position).to.not.deep.equal(startEventPosition);
      });

    cy.get('[data-test=undo]')
      .should('not.be.disabled')
      .click();

    getElementAtPosition(startEventPosition).should('exist');
    getElementAtPosition(startEventMoveToPosition).should('not.exist');

    const taskPosition1 = { x: 50, y: 400 };
    const taskPosition2 = { x: taskPosition1.x + 200, y: taskPosition1.y };
    const taskPosition3 = { x: taskPosition2.x + 200, y: taskPosition2.y };
    dragFromSourceToDest('processmaker-modeler-task', '.paper-container', taskPosition1);

    cy.wait(100);

    getElementAtPosition(taskPosition1)
      .click()
      .wait(100)
      .moveTo(taskPosition2.x, taskPosition2.y)
      .moveTo(taskPosition3.x, taskPosition3.y);

    cy.get('[data-test=undo]').click();

    cy.wait(100);

    getElementAtPosition(taskPosition2).should('exist');
    getElementAtPosition(taskPosition3).should('not.exist');
  });
});
