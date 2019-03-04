import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update task name', () => {
    const testString = 'testing';

    dragFromSourceToDest(nodeTypes.task, 200, 200);

    cy.get('.joint-viewport').find('.joint-type-processmaker-components-nodes-task').click({force: true});
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
