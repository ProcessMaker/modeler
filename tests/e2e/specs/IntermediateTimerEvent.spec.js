import {
  dragFromSourceToDest,
  getElementAtPosition,
  typeIntoTextInput,
  waitToRenderAllShapes,
  getLinksConnectedToElement,
  connectNodesWithFlow,
} from '../support/utils';

describe('Intermediate Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it.only('Update task name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-intermediate-catch-timer-event',
      '.paper-container',
      { x: 200, y: 200 }
    );

    waitToRenderAllShapes();

    getElementAtPosition({ x: 200, y: 200})
      .click();

    typeIntoTextInput('[name=\'name\']', testString);

    typeIntoTextInput('[name=\'name\']', testString);
    typeIntoTextInput('[name=\'name\']', testString);

    // cy.get('.joint-viewport').find('.joint-type-processmaker-components-nodes-task').click({ force: true });

    cy.get('[name=\'name\']').should('have.value', testString);
  });
});
