import { clickAndDropElement, getElementAtPosition, typeIntoTextInput } from '../support/utils';

import { nodeTypes } from '../support/constants';

describe.skip('Exclusive Gateway', () => {
  it('Update exclusive gateway name', () => {
    const testString = 'testing';
    const exclusiveGatewayPosition = { x: 200, y: 200 };

    clickAndDropElement(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    getElementAtPosition(exclusiveGatewayPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
