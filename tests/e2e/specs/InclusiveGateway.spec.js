import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe.only('Inclusive Gateway', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update inclusive gateway name', () => {
    const testString = 'testing';
    const parallelGatewaySelector = '#v-23';

    dragFromSourceToDest(
      nodeTypes.inclusiveGateway,
      '.paper-container',
      200, 200
    );

    cy.get(parallelGatewaySelector).click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });
});
