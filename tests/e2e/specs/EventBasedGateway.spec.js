import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Event-based Gateway', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update event-based gateway name', () => {
    const testString = 'testing';

    const eventBasedGatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.eventBasedGateway, eventBasedGatewayPosition);

    waitToRenderAllShapes();
    getElementAtPosition(eventBasedGatewayPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
