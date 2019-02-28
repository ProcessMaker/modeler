import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
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

    waitToRenderAllShapes();
    getElementAtPosition(exclusiveGatewayPosition).click();

    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });
});
