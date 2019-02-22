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
    const exclusiveGatewaySelector = '#v-19';

    dragFromSourceToDest(
      'processmaker-modeler-exclusive-gateway',
      '.paper-container',
      200, 200
    );

    cy.get(exclusiveGatewaySelector).click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });
});
