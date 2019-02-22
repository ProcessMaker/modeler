import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

describe('Exclusive Gateway', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update exclusive gateway name', () => {
    const testString = 'testing';
    const exclusiveGatewayPosition = { x: 200, y: 200 };

    dragFromSourceToDest(
      'processmaker-modeler-exclusive-gateway',
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
