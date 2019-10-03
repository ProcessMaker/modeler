import { dragFromSourceToDest, getElementAtPosition, typeIntoTextInput } from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Exclusive Gateway', () => {
  it('Update exclusive gateway name', () => {
    const testString = 'testing';
    const exclusiveGatewayPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    getElementAtPosition(exclusiveGatewayPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
