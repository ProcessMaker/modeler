import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe.only('Start Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update Start Timer Event Name', () => {
    const testString = 'testing';
    const startTimerEventPosition = { x: 250, y: 250 };

    dragFromSourceToDest(
      nodeTypes.startTimerEvent,
      '.paper-container',
      startTimerEventPosition
    );

    cy.get('.joint-viewport').find('#j_5').click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });
});
