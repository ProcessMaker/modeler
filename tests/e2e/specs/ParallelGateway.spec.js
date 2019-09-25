import { dragFromSourceToDest, getElementAtPosition, typeIntoTextInput } from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Parallel Gateway', () => {
  it('Update parallel gateway name', () => {
    const testString = 'testing';
    const parallelGatewayPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.parallelGateway, parallelGatewayPosition);

    getElementAtPosition(parallelGatewayPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
