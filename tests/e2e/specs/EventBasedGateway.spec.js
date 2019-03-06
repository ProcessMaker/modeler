import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
  connectNodesWithFlow,
  getGraphElements,
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

  it('Only have one incoming flow', () => {
    const eventBasedGatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.eventBasedGateway, eventBasedGatewayPosition);

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('sequence-flow-button', startEventPosition, eventBasedGatewayPosition);

    const taskPosition = { x: 350, y: 350 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    connectNodesWithFlow('sequence-flow-button', taskPosition, eventBasedGatewayPosition);

    const totalNumberOfElements = 4;
    getGraphElements().should('have.length', totalNumberOfElements);
  });
});
