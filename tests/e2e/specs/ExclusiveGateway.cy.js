import {
  clickAndDropElement,
  getElementAtPosition,
  toggleInspector,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Exclusive Gateway', () => {
  it('Update exclusive gateway name', () => {
    const testString = 'testing';
    const exclusiveGatewayPosition = { x: 400, y: 200 };

    clickAndDropElement(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);
    waitToRenderAllShapes();

    getElementAtPosition(exclusiveGatewayPosition).click();

    toggleInspector();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
