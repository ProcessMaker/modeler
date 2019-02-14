import {
  dragFromSourceToDest,
  getElementAtPosition,
  getGraphElements,
} from '../support/utils';

function getDeleteButtonForElement($element) {
  return cy.get(`#${$element.attr('id')} ~ [data-test=delete-button]`);
}

describe.only('Undo/redo', () => {
  const taskPosition = { x: 300, y: 500 };

  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can undo and redo adding a task', () => {
    dragFromSourceToDest('processmaker-modeler-task', '.paper-container', taskPosition);

    cy.get('[data-test=undo]').click();

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=redo]').click();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo and redo deleting a task', () => {
    dragFromSourceToDest('processmaker-modeler-task', '.paper-container', taskPosition);

    /* Wait for jointjs to render the shape */
    cy.wait(100);

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getDeleteButtonForElement($task).click();
      });

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=undo]').click();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });
});
