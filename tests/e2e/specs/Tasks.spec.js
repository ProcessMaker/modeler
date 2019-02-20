import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

describe('Tasks', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update task name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-components-nodes-task').click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });
});
