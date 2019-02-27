import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Exclusive Gateway', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update exclusive gateway name', () => {
    const testString = 'testing';
    const exclusiveGatewayPosition = { x: 200, y: 200 };

    dragFromSourceToDest(
      nodeTypes.exclusiveGateway,
      '.paper-container',
      exclusiveGatewayPosition
    );

    getElementAtPosition(exclusiveGatewayPosition)
      .then(() => {
        typeIntoTextInput('[name=\'name\']', testString);
        cy.get('[name=\'name\']').should('have.value', testString);
      });
  });
});
