import { addNodeTypeToPaper, getElementAtPosition, typeIntoTextInput } from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Parallel Gateway', () => {
  it('Update parallel gateway name', () => {
    const parallelGatewayPosition = { x: 200, y: 200 };
    addNodeTypeToPaper(parallelGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-parallel-gateway');
    getElementAtPosition(parallelGatewayPosition).click();

    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);

    cy.get('[name=name]').should('have.value', testString);
  });
});
