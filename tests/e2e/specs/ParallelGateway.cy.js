import {
  addNodeTypeToPaper,
  getElementAtPosition,
  toggleInspector,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Parallel Gateway', () => {
  it('Update parallel gateway name', () => {
    const parallelGatewayPosition = { x: 350, y: 200 };
    addNodeTypeToPaper(parallelGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-parallel-gateway');
    waitToRenderAllShapes();
    getElementAtPosition(parallelGatewayPosition).click();

    toggleInspector();
    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);

    cy.get('[name=name]').should('have.value', testString);
  });
});
